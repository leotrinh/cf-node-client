"use strict";

const CloudControllerBase = require("./CloudControllerBase");
const operations = require("./v3-237-operations.json");

/** Version-pinned, low-level Cloud Controller v3 operations. */
class V3Api extends CloudControllerBase {
    /** Return a copy of the documented operation definitions. */
    static get operations() { return operations.map(operation => ({ ...operation })); }

    /**
     * Invoke a named operation from the Cloud Controller 3.237.0 reference.
     * Pass path variables in params, query parameters in query, and an object,
     * Buffer, or FormData in body. For redirects use the redirect option.
     */
    invoke(anchor, { params = {}, query = {}, body, expectedStatus, headers = {}, binary = false, responseMetadata = false } = {}) {
        const operation = operations.find(entry => entry.anchor === anchor);
        if (!operation) throw new Error(`Unknown Cloud Foundry v3 operation: ${anchor}`);
        const missing = [];
        const route = operation.path.replace(/:([a-z_]+)/g, (_, name) => {
            if (params[name] === undefined || params[name] === null) {
                missing.push(name);
                return "";
            }
            return encodeURIComponent(String(params[name]));
        });
        if (missing.length) throw new Error(`Missing path parameters: ${missing.join(", ")}`);
        if (!this.API_URL) throw new Error("Cloud Controller endpoint is not set");
        const url = `${this.API_URL.replace(/\/$/, "")}${route}`;
        const options = {
            method: operation.method,
            url,
            qs: query,
            includeResponseMetadata: responseMetadata,
            headers: {
                ...(route === "/" || route === "/v3" ? {} : { Authorization: this.getAuthorizationHeader() }),
                Accept: "application/json", ...headers
            }
        };
        if (body !== undefined && body !== null) {
            if (operation.method === "GET" || operation.method === "DELETE") {
                throw new Error(`${operation.method} ${route} does not accept a request body`);
            }
            if (Buffer.isBuffer(body) || typeof body === "string" || (body && typeof body.getBoundary === "function")) {
                options.body = body;
                if (body && typeof body.getHeaders === "function") Object.assign(options.headers, body.getHeaders());
            } else {
                options.body = JSON.stringify(body);
                options.headers["Content-Type"] = "application/json";
            }
        }
        if (operation.status === 302 || (Array.isArray(operation.status) && operation.status.includes(302))) {
            options.redirect = "manual";
        }
        if (binary) options.encoding = null;
        const status = expectedStatus || operation.status;
        if (!status) throw new Error(`Response status for ${anchor} is undocumented in the extracted example; provide expectedStatus`);
        const statuses = Array.isArray(status) ? status : [status];
        const jsonOutput = !binary && !statuses.includes(302) && operation.exampleContentType === "application/json";
        return this.REST.request(options, status, jsonOutput);
    }
}

module.exports = V3Api;
