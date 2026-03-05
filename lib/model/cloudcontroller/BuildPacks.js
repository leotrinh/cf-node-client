"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * BuildPacks — build pack management for Cloud Foundry applications.
 * Supports both CF API v2 and v3 with automatic version routing.
 *
 * @class
 */
class BuildPacks extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
        // Well-known buildpack URL map (backward compat)
        this.buildpackMap = {
            static: "https://github.com/cloudfoundry/staticfile-buildpack",
            nodejs: "https://github.com/cloudfoundry/nodejs-buildpack",
            java: "https://github.com/cloudfoundry/java-buildpack",
            php: "https://github.com/cloudfoundry/php-buildpack",
            python: "https://github.com/cloudfoundry/python-buildpack"
        };
    }

    /**
     * Returns the URL for a well-known buildpack by key.
     * @param {String} key - Buildpack key (nodejs, java, php, python, static)
     * @return {String} Buildpack GitHub URL
     * @throws {Error} If key is unknown
     */
    get(key) {
        if (this.buildpackMap[key]) {
            return this.buildpackMap[key];
        }
        throw new Error("This Buildpack is not supported");
    }

    /**
     * Get BuildPacks list from the API
     * @param {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON buildpacks list
     */
    getBuildPacks(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/buildpacks`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {},
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/buildpacks`,
            qs: filter,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single BuildPack by GUID
     * @param {String} guid - BuildPack unique identifier
     * @return {Promise} Resolves with JSON buildpack object
     */
    getBuildPack(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/buildpacks/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/buildpacks/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Update a BuildPack
     * @param {String} guid - BuildPack unique identifier
     * @param {Object} buildPackOptions - Options to update
     * @return {Promise} Resolves with JSON buildpack object
     */
    update(guid, buildPackOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const v3Body = {
                name: buildPackOptions.name,
                position: buildPackOptions.position,
                enabled: buildPackOptions.enabled,
                locked: buildPackOptions.locked
            };
            if (buildPackOptions.filename) {
                v3Body.filename = buildPackOptions.filename;
            }
            return this.REST.requestV3("PATCH", `${this.API_URL}/v3/buildpacks/${guid}`, token, v3Body);
        }
        const options = {
            method: "PUT",
            url: `${this.API_URL}/v2/buildpacks/${guid}`,
            headers: { Authorization: token },
            form: buildPackOptions
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Delete a BuildPack
     * @param {String} guid - BuildPack unique identifier
     * @return {Promise} Resolves when buildpack is deleted
     */
    remove(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("DELETE", `${this.API_URL}/v3/buildpacks/${guid}`, token, null, this.HttpStatus.NO_CONTENT);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/buildpacks/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }
}

module.exports = BuildPacks;
