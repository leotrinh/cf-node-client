"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * AppsCore — CRUD and lifecycle operations for CF Applications.
 * Methods: getApps, getApp, add, update, stop, start, restart, getSummary, remove
 *
 * @class
 */
class AppsCore extends CloudControllerBase {

    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * List all applications.
     * @param {Object} [filter] - Query-string filter
     * @return {Promise}
     */
    getApps(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: this.buildResourceUrl("apps"),
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {}
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/apps`,
            headers: { Authorization: token },
            qs: filter || {}
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single application by GUID.
     * @param {String} appGuid
     * @return {Promise}
     */
    getApp(appGuid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: this.buildResourceUrl("apps", appGuid),
                headers: { Authorization: token, "Content-Type": "application/json" }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/apps/${appGuid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Find an Application by name using server-side filtering.
     * Returns the first matching resource or null if not found.
     * Optionally filter by space GUID.
     *
     * v2: Uses q=name:{name} filter (and q=space_guid:{spaceGuid} if provided)
     * v3: Uses names={name} filter (and space_guids={spaceGuid} if provided)
     *
     * @param  {String} name [Application name]
     * @param  {String} [spaceGuid] [Optional space GUID to narrow search]
     * @return {Promise} [Promise resolving to app resource or null]
     */
    getAppByName(name, spaceGuid) {
        if (!name || typeof name !== "string") {
            return Promise.reject(new Error("App name must be a non-empty string."));
        }
        let filter;
        if (this.isUsingV3()) {
            filter = { names: name };
            if (spaceGuid) { filter.space_guids = spaceGuid; }
        } else {
            filter = { q: [`name:${name}`] };
            if (spaceGuid) { filter.q.push(`space_guid:${spaceGuid}`); }
        }
        return this.getApps(filter).then(result => {
            const resources = result.resources || [];
            return resources.length > 0 ? resources[0] : null;
        });
    }

    /**
     * Create a new application.
     * @param {Object} appOptions
     * @return {Promise}
     */
    add(appOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this._addV3(appOptions, token);
        }
        return this._addV2(appOptions, token);
    }

    /** @private */
    _addV2(appOptions, token) {
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/apps`,
            headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
            form: JSON.stringify(appOptions)
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /** @private */
    _addV3(appOptions, token) {
        const options = {
            method: "POST",
            url: this.buildResourceUrl("apps"),
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(appOptions)
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update an application.
     * @param {String} appGuid
     * @param {Object} appOptions
     * @return {Promise}
     */
    update(appGuid, appOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this._updateV3(appGuid, appOptions, token);
        }
        return this._updateV2(appGuid, appOptions, token);
    }

    /** @private */
    _updateV2(appGuid, appOptions, token) {
        const options = {
            method: "PUT",
            url: `${this.API_URL}/v2/apps/${appGuid}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token },
            form: JSON.stringify(appOptions)
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /** @private */
    _updateV3(appGuid, appOptions, token) {
        const options = {
            method: "PATCH",
            url: this.buildResourceUrl("apps", appGuid),
            headers: { "Content-Type": "application/json", Authorization: token },
            body: JSON.stringify(appOptions)
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Stop an application.
     * v2: PUT /v2/apps/:guid { state: "STOPPED" }
     * v3: POST /v3/apps/:guid/actions/stop
     * @param {String} appGuid
     * @return {Promise}
     */
    stop(appGuid) {
        if (this.isUsingV3()) {
            const token = this.getAuthorizationHeader();
            const options = {
                method: "POST",
                url: `${this.buildResourceUrl("apps", appGuid)}/actions/stop`,
                headers: { "Content-Type": "application/json", Authorization: token }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        return this.update(appGuid, { state: "STOPPED" });
    }

    /**
     * Start an application.
     * v2: PUT /v2/apps/:guid { state: "STARTED" }
     * v3: POST /v3/apps/:guid/actions/start
     * @param {String} appGuid
     * @return {Promise}
     */
    start(appGuid) {
        if (this.isUsingV3()) {
            const token = this.getAuthorizationHeader();
            const options = {
                method: "POST",
                url: `${this.buildResourceUrl("apps", appGuid)}/actions/start`,
                headers: { "Content-Type": "application/json", Authorization: token }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        return this.update(appGuid, { state: "STARTED" });
    }

    /**
     * Restart an application (stop then start).
     * @param {String} appGuid
     * @return {Promise}
     */
    restart(appGuid) {
        return this.stop(appGuid).then(() => this.start(appGuid));
    }

    /**
     * Get app summary (v2) or app info (v3).
     * @param {String} appGuid
     * @return {Promise}
     */
    getSummary(appGuid) {
        if (this.isUsingV3()) return this.getApp(appGuid);
        const token = this.getAuthorizationHeader();
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/apps/${appGuid}/summary`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete an application.
     * @param {String} appGuid
     * @return {Promise}
     */
    remove(appGuid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "DELETE",
                url: this.buildResourceUrl("apps", appGuid),
                headers: { Authorization: token }
            };
            return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/apps/${appGuid}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * Get ALL apps across all pages (auto-pagination).
     * Returns a flat array of every app resource.
     *
     * Results are cached when caching is enabled.
     *
     * @param  {Object} [filter] Base filter (merged with pagination params)
     * @return {Promise<Array>} Flat array of all app resources
     */
    getAllApps(filter) {
        const self = this;
        return this.getAllResources(function (f) { return self.getApps(f); }, filter);
    }
}

module.exports = AppsCore;
