"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Domains — domain management for Cloud Foundry applications.
 * Supports both CF API v2 and v3 with automatic version routing.
 *
 * @class
 */
class Domains extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get Domains list
     * @param {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON domains list
     */
    getDomains(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/domains`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {},
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/domains`,
            qs: filter,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single Domain by GUID
     * @param {String} guid - Domain unique identifier
     * @return {Promise} Resolves with JSON domain object
     */
    getDomain(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/domains/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/domains/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Create a Domain
     * @param {Object} domainOptions - Domain creation options
     * @return {Promise} Resolves with JSON domain object
     */
    add(domainOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const v3Body = {
                name: domainOptions.name,
                internal: domainOptions.internal || false
            };
            if (domainOptions.organization_guid) {
                v3Body.organization_guid = domainOptions.organization_guid;
            }
            return this.REST.requestV3("POST", `${this.API_URL}/v3/domains`, token, v3Body, this.HttpStatus.CREATED);
        }
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/domains`,
            headers: { Authorization: token },
            form: domainOptions
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Delete a Domain
     * @param {String} guid - Domain unique identifier
     * @return {Promise} Resolves when domain is deleted
     */
    remove(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("DELETE", `${this.API_URL}/v3/domains/${guid}`, token, null, this.HttpStatus.NO_CONTENT);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/domains/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }
}

module.exports = Domains;
