"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * SpacesQuota — Space Quota management for Cloud Foundry.
 * v2 uses '/v2/space_quota_definitions', v3 uses '/v3/space_quotas'.
 *
 * @class
 */
class SpacesQuota extends CloudControllerBase {

    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get SpaceQuotas list
     * @param {Object} [filter]
     * @return {Promise}
     */
    getSpaceQuotas(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/space_quotas`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/space_quota_definitions`,
            qs: filter,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /** Alias for backward compatibility with tests */
    getQuotaDefinitions(filter) {
        return this.getSpaceQuotas(filter);
    }

    /**
     * Get a single SpaceQuota
     * @param {String} guid
     * @return {Promise}
     */
    getSpaceQuota(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/space_quotas/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/space_quota_definitions/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Create a SpaceQuota
     * @param {Object} quotaOptions
     * @return {Promise}
     */
    add(quotaOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const v3Body = this._translateToV3(quotaOptions, true);
            return this.REST.requestV3("POST", `${this.API_URL}/v3/space_quotas`, token, v3Body, this.HttpStatus.CREATED);
        }
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/space_quota_definitions`,
            headers: { Authorization: token },
            form: quotaOptions
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update a SpaceQuota
     * @param {String} guid
     * @param {Object} quotaOptions
     * @return {Promise}
     */
    update(guid, quotaOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const v3Body = this._translateToV3(quotaOptions, false);
            return this.REST.requestV3("PATCH", `${this.API_URL}/v3/space_quotas/${guid}`, token, v3Body, this.HttpStatus.OK);
        }
        const options = {
            method: "PUT",
            url: `${this.API_URL}/v2/space_quota_definitions/${guid}`,
            headers: { Authorization: token },
            form: quotaOptions
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete a SpaceQuota
     * @param {String} guid
     * @return {Promise}
     */
    remove(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("DELETE", `${this.API_URL}/v3/space_quotas/${guid}`, token, null, this.HttpStatus.NO_CONTENT);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/space_quota_definitions/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * @private
     */
    _translateToV3(opts, includeRelationships) {
        const v3 = { name: opts.name };
        if (includeRelationships && opts.organization_guid) {
            v3.relationships = { organization: { data: { guid: opts.organization_guid } } };
        }
        const limits = {};
        if (opts.memory_limit) limits.memory_limit_in_gb = opts.memory_limit / 1024;
        if (opts.instance_memory_limit) limits.process_memory_limit_in_mb = opts.instance_memory_limit;
        if (opts.app_instance_limit) limits.app_instance_limit = opts.app_instance_limit;
        if (Object.keys(limits).length) v3.limits = limits;
        return v3;
    }
}

module.exports = SpacesQuota;
