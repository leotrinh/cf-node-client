"use strict";

const HttpUtils = require("../../utils/HttpUtils");
const HttpStatus = require("../../utils/HttpStatus");
const CacheService = require("../../services/CacheService");

/**
 * Validate that a string is a proper HTTP/HTTPS URL.
 * @param {String} url - URL to validate
 * @return {Boolean} true if valid
 * @private
 */
function isValidEndpoint(url) {
    if (!url || typeof url !== "string") return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch (_) {
        return false;
    }
}

/**
 * Base class for Cloud Controller API models
 * Supports both Cloud Foundry API v2 and v3
 * Default: v3 (set apiVersion to "v2" in options to use v2)
 */
class CloudControllerBase {

    /**
     * @param {String} endPoint - CC endpoint (e.g., https://api.cloudfoundry.com)
     * @param {Object} options - Optional configuration
     * @param {String} options.apiVersion - API version: "v2" or "v3" (default: "v3")
     * @constructor
     * @returns {void}
     */
    constructor(endPoint, options = {}) {
        if (endPoint && !isValidEndpoint(endPoint)) {
            throw new Error(`Invalid endpoint URL: "${endPoint}". Must be a valid http:// or https:// URL.`);
        }
        this.API_URL = endPoint;
        this.REST = new HttpUtils();
        this.HttpStatus = HttpStatus;
        // Delegate config and version management to ConfigManager service
        const configManager = require("../../services/ConfigManagerService");
        this.apiConfig = configManager.getApiConfig(options.apiVersion || "v3");
        this.apiVersionManager = configManager.getApiVersionManager(this.apiConfig.getVersion());

        // ── Cache ──────────────────────────────────────────────────────
        this._cacheEnabled = options.cache === true;
        this._cache = this._cacheEnabled
            ? new CacheService({ ttl: options.cacheTTL || 30000 })
            : null;
    }

    /**
     * Set endpoint
     * @param {String} endPoint [CC endpoint]
     * @throws {Error} If endpoint is not a valid URL
     * @returns {void}
     */
    setEndPoint (endPoint) {
        console.log(`Setting API endpoint to: ${endPoint}`);
        if (!isValidEndpoint(endPoint)) {
            throw new Error(`Invalid endpoint URL: "${endPoint}". Must be a valid http:// or https:// URL.`);
        }
        this.API_URL = endPoint;
    }

    /**
     * Set token
     * @param {JSON} token [Oauth token from UAA]
     * @throws {Error} If token is not provided or invalid
     * @returns {void}
     */
    setToken (token) {
        // Delegate error handling to ErrorService
        const errorService = require("../../services/ErrorService");
        if (!token) {
            errorService.throwTokenError();
        }
        this.UAA_TOKEN = token;
    }

    /**
     * Set API version (v2 or v3)
     * @param {String} version - API version (v2 or v3)
     * @throws {Error} If version is not supported
     * @returns {void}
     */
    setApiVersion(version) {
        this.apiConfig.setVersion(version);
        this.apiVersionManager.setVersion(version);
    }

    /**
     * Get current API version
     * @return {String} API version (v2 or v3)
     */
    getApiVersion() {
        return this.apiConfig.getVersion();
    }

    /**
     * Check if using API v3
     * @return {Boolean}
     */
    isUsingV3() {
        return this.apiConfig.isV3();
    }

    /**
     * Check if using API v2
     * @return {Boolean}
     */
    isUsingV2() {
        return this.apiConfig.isV2();
    }

    /**
     * Get authorization header
     * @return {String} Authorization header value
     * @throws {Error} If token is not set
     * @private
     */
    getAuthorizationHeader() {
        if (!this.UAA_TOKEN || !this.UAA_TOKEN.access_token) {
            throw new Error("UAA token not set. Call setToken() first before making API calls.");
        }
        return `${this.UAA_TOKEN.token_type || 'Bearer'} ${this.UAA_TOKEN.access_token}`;
    }

    /**
     * Build URL for a resource endpoint
     * @param {String} resourceName - Name of resource (e.g., "apps", "organizations")
     * @param {String} resourceId - Optional: specific resource ID
     * @return {String} Full URL to resource
     */
    buildResourceUrl(resourceName, resourceId = null) {
        return this.apiVersionManager.buildUrl(this.API_URL, resourceName, resourceId);
    }

    /**
     * Get endpoint path for a resource
     * @param {String} resourceName - Name of resource
     * @return {String} Endpoint path
     */
    getEndpointPath(resourceName) {
        return this.apiVersionManager.getEndpoint(resourceName);
    }

    /**
     * Get v3 field name equivalent for a v2 field
     * @param {String} resourceName - Name of resource
     * @param {String} fieldName - Field name (usually v2 name)
     * @return {String} Equivalent field name for current API version
     */
    getFieldName(resourceName, fieldName) {
        return this.apiVersionManager.getV3FieldName(resourceName, fieldName);
    }

    /**
     * Check if resource needs special handling for current API version
     * @param {String} resourceName - Name of resource
     * @return {Boolean}
     */
    needsSpecialHandling(resourceName) {
        return this.apiVersionManager.needsV3SpecialHandling(resourceName);
    }

    // ================================================================
    // CACHE
    // ================================================================

    /**
     * Enable the in-memory cache.
     * @param {Number} [ttlMs=30000] Cache TTL in milliseconds
     * @returns {void}
     */
    enableCache(ttlMs) {
        this._cacheEnabled = true;
        this._cache = new CacheService({ ttl: ttlMs || 30000 });
    }

    /**
     * Disable the cache and clear all entries.
     * @returns {void}
     */
    disableCache() {
        this._cacheEnabled = false;
        if (this._cache) {
            this._cache.clear();
            this._cache = null;
        }
    }

    /**
     * Clear all cached entries (cache stays enabled).
     * @returns {void}
     */
    clearCache() {
        if (this._cache) {
            this._cache.clear();
        }
    }

    /**
     * Execute a fetch and cache the result if caching is enabled.
     * @param {String} cacheKey   Unique key for this request
     * @param {Function} fetchFn  Function returning a Promise
     * @return {Promise} Resolved value (from cache or fresh fetch)
     * @private
     */
    _cachedFetch(cacheKey, fetchFn) {
        if (this._cacheEnabled && this._cache) {
            const cached = this._cache.get(cacheKey);
            if (cached !== undefined) {
                return Promise.resolve(cached);
            }
            const self = this;
            return fetchFn().then(function (result) {
                self._cache.set(cacheKey, result);
                return result;
            });
        }
        return fetchFn();
    }

    // ================================================================
    // PAGINATION — getAllResources
    // ================================================================

    /**
     * Auto-paginate through ALL pages of a list endpoint and return
     * a flat array of every resource.
     *
     * Works with both v2 and v3 response shapes:
     *   v2: { total_results, next_url, resources }
     *   v3: { pagination: { next: { href } }, resources }
     *
     * @param  {Function} fetchFn  A function(filter) → Promise<PageResponse>.
     *                             Typically: (f) => this.getOrganizations(f)
     * @param  {Object}   [filter] Base filter (merged with page param)
     * @return {Promise<Array>}    Flat array of all resource objects
     */
    getAllResources(fetchFn, filter) {
        const self = this;
        const isV3 = this.isUsingV3();
        const cacheKey = filter
            ? "allResources:" + JSON.stringify(filter)
            : "allResources:*";

        function fetchAll() {
            const allResources = [];
            let page = 1;

            function fetchPage() {
                const pageFilter = Object.assign({}, filter || {});
                if (isV3) {
                    pageFilter.page = page;
                    pageFilter.per_page = pageFilter.per_page || 200;
                } else {
                    pageFilter.page = page;
                    pageFilter["results-per-page"] = pageFilter["results-per-page"] || 100;
                }

                return fetchFn(pageFilter).then(function (response) {
                    if (response && response.resources) {
                        allResources.push.apply(allResources, response.resources);
                    }

                    // Determine if there is a next page
                    let hasNext = false;
                    if (isV3) {
                        hasNext = !!(response && response.pagination && response.pagination.next);
                    } else {
                        hasNext = !!(response && response.next_url);
                    }

                    if (hasNext) {
                        page++;
                        return fetchPage();
                    }
                    return allResources;
                });
            }

            return fetchPage();
        }

        return this._cachedFetch(cacheKey, fetchAll);
    }
}

module.exports = CloudControllerBase;