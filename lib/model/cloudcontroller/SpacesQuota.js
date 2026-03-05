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
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/space_quotas`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {},
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
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
     * Translate v2 quota options to v3 space_quotas format.
     *
     * CF v3 space_quotas body uses nested sub-objects:
     *   relationships.organization → required on create
     *   apps     → total_memory_in_mb, per_process_memory_in_mb, total_instances
     *   services → paid_services_allowed, total_service_instances
     *   routes   → total_routes, total_reserved_ports
     *
     * @private
     * @param {Object} opts - v2-style quota options
     * @param {Boolean} includeRelationships - true for create, false for update
     * @return {Object} v3 body
     */
    _translateToV3(opts, includeRelationships) {
        const v3 = { name: opts.name };

        // Space quotas require org relationship on create
        if (includeRelationships && opts.organization_guid) {
            v3.relationships = { organization: { data: { guid: opts.organization_guid } } };
        }

        // Apps quota: memory, per-process memory, instances
        const apps = {};
        if (opts.memory_limit !== undefined) apps.total_memory_in_mb = opts.memory_limit;
        if (opts.instance_memory_limit !== undefined) apps.per_process_memory_in_mb = opts.instance_memory_limit;
        if (opts.app_instance_limit !== undefined) apps.total_instances = opts.app_instance_limit;
        if (Object.keys(apps).length) v3.apps = apps;

        // Services quota: paid services, total instances
        const services = {};
        if (opts.non_basic_services_allowed !== undefined) services.paid_services_allowed = opts.non_basic_services_allowed;
        if (opts.total_services !== undefined) services.total_service_instances = opts.total_services;
        if (Object.keys(services).length) v3.services = services;

        // Routes quota: total routes, reserved ports
        const routes = {};
        if (opts.total_routes !== undefined) routes.total_routes = opts.total_routes;
        if (opts.total_reserved_route_ports !== undefined) routes.total_reserved_ports = opts.total_reserved_route_ports;
        if (Object.keys(routes).length) v3.routes = routes;

        return v3;
    }
}

module.exports = SpacesQuota;
