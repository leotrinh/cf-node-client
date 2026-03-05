"use strict";

const CloudControllerBase = require("./CloudControllerBase");
const HttpUtils = require("../../utils/HttpUtils");
const fs = require("fs");

/**
 * AppsDeployment — deployment, runtime info, and service-binding operations.
 * Methods: upload, getStats, getInstances, getAppRoutes, associateRoute,
 *          getServiceBindings, removeServiceBindings, getEnvironmentVariables,
 *          setEnvironmentVariables, restage, getDroplets, getPackages, getProcesses
 *
 * @class
 */
class AppsDeployment extends CloudControllerBase {

    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Upload application source code.
     * @param {String} appGuid
     * @param {String} filePath - Local file path to zip
     * @param {Boolean} [async=false]
     * @return {Promise}
     */
    upload(appGuid, filePath, async) {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const asyncFlag = typeof async === "boolean" && async;

        if (this.isUsingV3()) {
            return this._uploadV3(appGuid, filePath, fileSizeInBytes, asyncFlag);
        }
        return this._uploadV2(appGuid, filePath, fileSizeInBytes, asyncFlag);
    }

    /** @private */
    _uploadV2(appGuid, filePath, fileSizeInBytes, asyncFlag) {
        const url = `${this.API_URL}/v2/apps/${appGuid}/bits`;
        const options = {
            multipart: true,
            accessToken: this.UAA_TOKEN.access_token,
            query: { guid: appGuid, async: asyncFlag },
            data: {
                resources: JSON.stringify([]),
                application: HttpUtils.file(filePath, "application/zip", fileSizeInBytes)
            }
        };
        return this.REST.upload(url, options, this.HttpStatus.CREATED, false);
    }

    /** @private */
    _uploadV3(appGuid, filePath, fileSizeInBytes, asyncFlag) {
        const url = `${this.API_URL}/v3/apps/${appGuid}/packages`;
        const options = {
            multipart: true,
            accessToken: this.UAA_TOKEN.access_token,
            query: { guid: appGuid, async: asyncFlag },
            data: {
                type: "bits",
                data: HttpUtils.file(filePath, "application/zip", fileSizeInBytes)
            }
        };
        return this.REST.upload(url, options, this.HttpStatus.CREATED, false);
    }

    /**
     * Get detailed stats for a started app.
     * @param {String} appGuid
     * @return {Promise}
     */
    getStats(appGuid) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/stats`
            : `${this.API_URL}/v2/apps/${appGuid}/stats`;
        const options = { method: "GET", url, headers: { Authorization: token } };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get instance information.
     * @param {String} appGuid
     * @return {Promise}
     */
    getInstances(appGuid) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/processes`
            : `${this.API_URL}/v2/apps/${appGuid}/instances`;
        const options = { method: "GET", url, headers: { Authorization: token } };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get routes for an app.
     * @param {String} appGuid
     * @return {Promise}
     */
    getAppRoutes(appGuid) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/routes`
            : `${this.API_URL}/v2/apps/${appGuid}/routes`;
        const options = { method: "GET", url, headers: { Authorization: token } };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Associate a route with an app.
     * @param {String} appGuid
     * @param {String} routeGuid
     * @return {Promise}
     */
    associateRoute(appGuid, routeGuid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "PUT",
                url: `${this.API_URL}/v3/apps/${appGuid}/routes/${routeGuid}`,
                headers: { Authorization: token, "Content-Type": "application/json" }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "PUT",
            url: `${this.API_URL}/v2/apps/${appGuid}/routes/${routeGuid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Get service bindings for an app.
     * @param {String} appGuid
     * @param {Object} [filter]
     * @return {Promise}
     */
    getServiceBindings(appGuid, filter) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/service_credential_bindings`
            : `${this.API_URL}/v2/apps/${appGuid}/service_bindings`;
        const options = { method: "GET", url, headers: { Authorization: token }, qs: filter || {} };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Remove a service binding from an app.
     * @param {String} appGuid
     * @param {String} serviceBindingGuid
     * @return {Promise}
     */
    removeServiceBindings(appGuid, serviceBindingGuid) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/service_credential_bindings/${serviceBindingGuid}`
            : `${this.API_URL}/v2/apps/${appGuid}/service_bindings/${serviceBindingGuid}`;
        const options = {
            method: "DELETE", url,
            headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * Get environment variables for an app.
     * @param {String} appGuid
     * @return {Promise}
     */
    getEnvironmentVariables(appGuid) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/environment_variables`
            : `${this.API_URL}/v2/apps/${appGuid}/env`;
        const options = { method: "GET", url, headers: { Authorization: token } };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Set environment variables for an app.
     * NOTE: v2 path calls this.update() — only works when mixed into Apps facade.
     * @param {String} appGuid
     * @param {Object} variables
     * @return {Promise}
     */
    setEnvironmentVariables(appGuid, variables) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "PATCH",
                url: `${this.API_URL}/v3/apps/${appGuid}/environment_variables`,
                headers: { "Content-Type": "application/json", Authorization: token },
                body: JSON.stringify({ var: variables })
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        // v2 path — delegates to update() which comes from AppsCore via Apps facade
        if (typeof this.update !== "function") {
            throw new Error(
                "setEnvironmentVariables() v2 requires the Apps facade (mixin with AppsCore). " +
                "Use the Apps class instead, or switch to v3 mode."
            );
        }
        return this.update(appGuid, { environment_json: variables });
    }

    /**
     * Restage an application (v2 only).
     * @param {String} appGuid
     * @return {Promise}
     */
    restage(appGuid) {
        if (this.isUsingV3()) {
            throw new Error("Restage is not directly supported in v3 API. Use package/droplet endpoints instead.");
        }
        const token = this.getAuthorizationHeader();
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/apps/${appGuid}/restage`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Get droplets for an app (v3 only).
     * @param {String} appGuid
     * @return {Promise}
     */
    getDroplets(appGuid) {
        if (!this.isUsingV3()) throw new Error("getDroplets is only available in v3 API");
        const token = this.getAuthorizationHeader();
        const options = {
            method: "GET",
            url: `${this.API_URL}/v3/apps/${appGuid}/droplets`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get packages for an app (v3 only).
     * @param {String} appGuid
     * @return {Promise}
     */
    getPackages(appGuid) {
        if (!this.isUsingV3()) throw new Error("getPackages is only available in v3 API");
        const token = this.getAuthorizationHeader();
        const options = {
            method: "GET",
            url: `${this.API_URL}/v3/apps/${appGuid}/packages`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get processes for an app (v3 only).
     * @param {String} appGuid
     * @return {Promise}
     */
    getProcesses(appGuid) {
        if (!this.isUsingV3()) throw new Error("getProcesses is only available in v3 API");
        const token = this.getAuthorizationHeader();
        const options = {
            method: "GET",
            url: `${this.API_URL}/v3/apps/${appGuid}/processes`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }
}

module.exports = AppsDeployment;
