"use strict";

const fetch = require("node-fetch");
const https = require("https");
const http = require("http");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

// Reusable HTTPS agent that skips TLS verification (for self-signed CF endpoints)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const httpAgent = new http.Agent();

/**
 * HttpUtils — core HTTP layer for all Cloud Foundry REST operations.
 * Replaces deprecated `request` + `restler` with `node-fetch` + `form-data`.
 *
 * @class
 */
class HttpUtils {

    /**
     * @constructor
     * @returns {void}
     */
    constructor() {}

    /**
     * Build a full URL with query-string parameters appended.
     *
     * @param {String} baseUrl - Base URL
     * @param {Object} qs - Query-string key/value pairs
     * @return {String} URL with query string
     * @private
     */
    _buildUrl(baseUrl, qs) {
        if (!qs || Object.keys(qs).length === 0) return baseUrl;
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(qs)) {
            if (value !== undefined && value !== null) {
                // Support arrays (e.g. q=["name:foo","space_guid:bar"])
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, String(v)));
                } else {
                    params.append(key, String(value));
                }
            }
        }
        const sep = baseUrl.includes("?") ? "&" : "?";
        return `${baseUrl}${sep}${params.toString()}`;
    }

    /**
     * Establish HTTP communications using REST verbs: GET/POST/PUT/PATCH/DELETE.
     * Drop-in replacement for the old `request`-based implementation.
     *
     * @param  {Object} options          [request options: method, url, headers, body, form, json, qs, encoding]
     * @param  {Number|Number[]} httpStatusAssert [expected HTTP status code(s) — single number or array]
     * @param  {Boolean} jsonOutput      [true → parse response as JSON; false → return raw text/buffer]
     * @return {Promise}                 [resolves with JSON object or string]
     *
     * @example
     * const options = { method: 'GET', url: 'https://api.cf.example.com/v2/info' };
     * httpUtils.request(options, 200, true);
     */
    async request(options, httpStatusAssert, jsonOutput) {
        const method = (options.method || "GET").toUpperCase();
        const agent = options.url.startsWith("https") ? httpsAgent : httpAgent;

        const fetchOpts = {
            method,
            headers: { ...(options.headers || {}) },
            agent
        };

        // --- Body handling (mutually exclusive) ---
        if (options.body) {
            // Raw body string (already stringified JSON, etc.)
            fetchOpts.body = options.body;
        } else if (options.form) {
            // Form-urlencoded body
            if (typeof options.form === "string") {
                fetchOpts.body = options.form;
                if (!fetchOpts.headers["Content-Type"] && !fetchOpts.headers["content-type"]) {
                    fetchOpts.headers["Content-Type"] = "application/x-www-form-urlencoded";
                }
            } else {
                fetchOpts.body = new URLSearchParams(options.form).toString();
                if (!fetchOpts.headers["Content-Type"] && !fetchOpts.headers["content-type"]) {
                    fetchOpts.headers["Content-Type"] = "application/x-www-form-urlencoded";
                }
            }
        } else if (options.json && typeof options.json === "object") {
            // JSON object body
            fetchOpts.body = JSON.stringify(options.json);
            if (!fetchOpts.headers["Content-Type"] && !fetchOpts.headers["content-type"]) {
                fetchOpts.headers["Content-Type"] = "application/json";
            }
        }

        // --- Query string ---
        const url = this._buildUrl(options.url, options.qs);

        // --- Execute ---
        const response = await fetch(url, fetchOpts);

        // Helper: check if actual status matches expected (single number or array)
        const _statusOk = (actual, expected) =>
            Array.isArray(expected) ? expected.includes(actual) : actual === expected;

        // Binary mode (for downloads)
        if (options.encoding === null) {
            if (!_statusOk(response.status, httpStatusAssert)) {
                const errText = await response.text();
                throw new Error(errText || `HTTP ${response.status}`);
            }
            return response.buffer();
        }

        const text = await response.text();

        if (!_statusOk(response.status, httpStatusAssert)) {
            if (!text || text.length === 0) {
                throw new Error("EMPTY_BODY");
            }
            // Try to parse error body as JSON for better error info
            try {
                const errJson = JSON.parse(text);
                const errMsg = errJson.description
                    || errJson.message
                    || (errJson.errors && errJson.errors.length > 0 && errJson.errors[0].detail)
                    || text;
                const err = new Error(errMsg);
                err.statusCode = response.status;
                err.body = errJson;
                throw err;
            } catch (e) {
                if (e.statusCode) throw e; // re-throw structured error
                throw new Error(text);
            }
        }

        if (jsonOutput) {
            try {
                return JSON.parse(text);
            } catch (parseErr) {
                throw new Error(text);
            }
        }

        return text;
    }

    /**
     * Make a v3 API request.
     * Automatically handles JSON content type and v3-specific requirements.
     *
     * @param {String} method - HTTP method (GET, POST, PUT, PATCH, DELETE)
     * @param {String} url - Request URL
     * @param {String} token - OAuth Authorization header value
     * @param {Object} data - Request body data (auto-stringified)
     * @param {Number} expectedStatus - Expected HTTP status code
     * @return {Promise} Resolves with response JSON
     */
    requestV3(method, url, token, data = null, expectedStatus = 200) {
        const options = {
            method,
            url,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: token
            }
        };

        if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
            options.body = JSON.stringify(data);
        }

        return this.request(options, expectedStatus, true);
    }

    /**
     * Make a v2 API request.
     * Automatically handles form-urlencoded content type and v2-specific requirements.
     *
     * @param {String} method - HTTP method (GET, POST, PUT, DELETE)
     * @param {String} url - Request URL
     * @param {String} token - OAuth Authorization header value
     * @param {Object} data - Request body data (form-encoded)
     * @param {Number} expectedStatus - Expected HTTP status code
     * @return {Promise} Resolves with response JSON
     */
    requestV2(method, url, token, data = null, expectedStatus = 200) {
        const options = {
            method,
            url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: token
            }
        };

        if (data && (method === "POST" || method === "PUT")) {
            options.form = data;
        }

        return this.request(options, expectedStatus, true);
    }

    /**
     * Upload a file to Cloud Controller using multipart/form-data.
     * Replaces the old `restler`-based upload that was broken on Node 12+.
     *
     * @param  {String} url              [target URL]
     * @param  {Object} options          [upload options: method, accessToken, data, query, multipart]
     * @param  {Number} httpStatusAssert [expected HTTP status code]
     * @param  {Boolean} jsonOutput      [true → parse response as JSON]
     * @return {Promise}                 [resolves with JSON or string]
     */
    async upload(url, options, httpStatusAssert, jsonOutput) {
        const form = new FormData();
        const agent = url.startsWith("https") ? httpsAgent : httpAgent;

        // Build multipart form from the restler-style `data` object
        if (options.data) {
            for (const [key, value] of Object.entries(options.data)) {
                if (value && typeof value === "object" && value._filePath) {
                    // Our new file descriptor (replaces rest.file())
                    form.append(key, fs.createReadStream(value._filePath), {
                        filename: value._filename || path.basename(value._filePath),
                        contentType: value._contentType || "application/octet-stream",
                        knownLength: value._size || undefined
                    });
                } else if (typeof value === "string" || Buffer.isBuffer(value)) {
                    form.append(key, value);
                } else {
                    form.append(key, String(value));
                }
            }
        }

        // Build URL with query params
        let fullUrl = url;
        if (options.query) {
            fullUrl = this._buildUrl(url, options.query);
        }

        const fetchOpts = {
            method: (options.method || "PUT").toUpperCase(),
            headers: {
                ...form.getHeaders()
            },
            body: form,
            agent
        };

        if (options.accessToken) {
            fetchOpts.headers["Authorization"] = `bearer ${options.accessToken}`;
        }

        const response = await fetch(fullUrl, fetchOpts);
        const text = await response.text();

        if (response.status !== httpStatusAssert) {
            throw new Error(text || `Upload failed with status ${response.status}`);
        }

        return jsonOutput ? JSON.parse(text) : text;
    }
}

/**
 * Create a file descriptor for multipart uploads.
 * Replaces `restler.file()` which is no longer available.
 *
 * @param {String} filePath - Path to the file
 * @param {String} contentType - MIME type (default: application/zip)
 * @param {Number} size - File size in bytes
 * @return {Object} File descriptor object for HttpUtils.upload()
 */
HttpUtils.file = function (filePath, contentType, size) {
    return {
        _filePath: filePath,
        _filename: path.basename(filePath),
        _contentType: contentType || "application/zip",
        _size: size || 0
    };
};

module.exports = HttpUtils;
