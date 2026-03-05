"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Stacks — stack management for building applications on Cloud Foundry.
 * Supports both CF API v2 and v3 with automatic version routing.
 *
 * @class
 */
class Stacks extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get Stacks list
     * @param {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON stacks list
     */
    getStacks(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/stacks`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/stacks`,
            qs: filter,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single Stack by GUID
     * @param {String} guid - Stack unique identifier
     * @return {Promise} Resolves with JSON stack object
     */
    getStack(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/stacks/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/stacks/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }
}

module.exports = Stacks;
