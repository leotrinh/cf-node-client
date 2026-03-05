"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Users — user management for Cloud Foundry organizations and spaces.
 * Supports both CF API v2 and v3 with automatic version routing.
 *
 * @class
 */
class Users extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get Users list
     * @param {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON users list
     */
    getUsers(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/users`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {},
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/users`,
            qs: filter,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single User by GUID
     * @param {String} guid - User unique identifier
     * @return {Promise} Resolves with JSON user object
     */
    getUser(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/users/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/users/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Create a User
     * @param {Object} userOptions - User creation options
     * @return {Promise} Resolves with JSON user object
     */
    add(userOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const v3Body = {
                guid: userOptions.guid
            };
            if (userOptions.metadata) {
                v3Body.metadata = userOptions.metadata;
            }
            return this.REST.requestV3("POST", `${this.API_URL}/v3/users`, token, v3Body, this.HttpStatus.CREATED);
        }
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/users`,
            headers: { Authorization: token },
            form: userOptions
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Delete a User
     * @param {String} guid - User unique identifier
     * @return {Promise} Resolves when user is deleted
     */
    remove(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("DELETE", `${this.API_URL}/v3/users/${guid}`, token, null, this.HttpStatus.ACCEPTED);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/users/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }
}

module.exports = Users;
