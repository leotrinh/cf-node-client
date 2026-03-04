"use strict";

/**
 * Configuration management for Cloud Foundry API versions (v2 and v3)
 * Default is v3, but v2 can be used for backward compatibility
 */
class ApiConfig {
    constructor(options = {}) {
        // Default to v3, allow override to v2
        this.apiVersion = options.apiVersion || "v3";
        
        // Validate API version
        if (!["v2", "v3"].includes(this.apiVersion)) {
            throw new Error(`Invalid API version: ${this.apiVersion}. Supported versions: v2, v3`);
        }
    }

    /**
     * Get current API version
     * @return {String} API version (v2 or v3)
     */
    getVersion() {
        return this.apiVersion;
    }

    /**
     * Set API version
     * @param {String} version API version (v2 or v3)
     * @throws {Error} If version is not supported
     */
    setVersion(version) {
        if (!["v2", "v3"].includes(version)) {
            throw new Error(`Invalid API version: ${version}. Supported versions: v2, v3`);
        }
        this.apiVersion = version;
    }

    /**
     * Check if using v3
     * @return {Boolean} true if using v3
     */
    isV3() {
        return this.apiVersion === "v3";
    }

    /**
     * Check if using v2
     * @return {Boolean} true if using v2
     */
    isV2() {
        return this.apiVersion === "v2";
    }

    /**
     * Get supported API versions
     * @return {Array} Array of supported API versions
     */
    getSupportedVersions() {
        return ["v2", "v3"];
    }
}

module.exports = ApiConfig;
