"use strict";

const HttpUtils = require("../../utils/HttpUtils");
const HttpStatus = require("../../utils/HttpStatus");

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
        this.API_URL = endPoint;
        this.REST = new HttpUtils();
        this.HttpStatus = HttpStatus;
        // Delegate config and version management to ConfigManager service
        const configManager = require("../../services/ConfigManagerService");
        this.apiConfig = configManager.getApiConfig(options.apiVersion || "v3");
        this.apiVersionManager = configManager.getApiVersionManager(this.apiConfig.getVersion());
    }

    /**
     * Set endpoint
     * @param {String} endPoint [CC endpoint]
     * @returns {void}
     */
    setEndPoint (endPoint) {

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
}

// Export the class  
// Also export as CloudControllerAbs for backward compatibility with old constructor-based code
const CloudControllerAbs = function(endPoint, options = {}) {
    return new CloudControllerBase(endPoint, options);
};

// Preserve the prototype chain for util.inherits compatibility
CloudControllerAbs.prototype = CloudControllerBase.prototype;

// Make CloudControllerAbs callable with .call() for the old pattern
function CloudControllerAbsConstructor(endPoint, options = {}) {
    // Copy prototype methods to instance
    Object.setPrototypeOf(this, CloudControllerBase.prototype);
    // Initialize using CloudControllerBase constructor logic
    this.API_URL = endPoint;
    const HttpUtils = require('../../utils/HttpUtils');
    this.REST = new HttpUtils();
    const HttpStatus = require('../../utils/HttpStatus');
    this.HttpStatus = HttpStatus;
    const configManager = require('../../services/ConfigManagerService');
    this.apiConfig = configManager.getApiConfig(options.apiVersion || 'v3');
    this.apiVersionManager = configManager.getApiVersionManager(this.apiConfig.getVersion());
}

// Copy all CloudControllerBase methods to CloudControllerAbsConstructor
Object.getOwnPropertyNames(CloudControllerBase.prototype).forEach(name => {
    if (name !== 'constructor') {
        CloudControllerAbsConstructor.prototype[name] = CloudControllerBase.prototype[name];
    }
});

module.exports = CloudControllerBase;
module.exports.CloudControllerAbs = CloudControllerAbsConstructor;