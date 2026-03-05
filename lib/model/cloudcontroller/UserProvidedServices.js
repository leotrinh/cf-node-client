"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage User Provided Services on Cloud Foundry.
 * Supports both CF API v2 and v3 with automatic version routing.
 * {@link https://docs.cloudfoundry.org/devguide/services/user-provided.html}
 *
 * NOTE: V3 methods that need query-string filters use this.REST.request() with
 * manual headers + qs, while simple v3 calls use this.REST.requestV3().
 * This is because requestV3() does not support the qs parameter.
 *
 * @class
 */
class UserProvidedServices extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get user-provided services
     * v2: {@link http://apidocs.cloudfoundry.org/217/user_provided_service_instances/list_all_user_provided_service_instances.html}
     * v3: Uses /v3/service_instances with type=user-provided filter
     *
     * @return {Promise} Resolves with JSON services list
     */
    getServices() {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/service_instances`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: { type: "user-provided" },
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/user_provided_service_instances`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a specific user-provided service
     * v2: {@link http://apidocs.cloudfoundry.org/217/user_provided_service_instances/retrieve_a_particular_user_provided_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-service-instance}
     *
     * @param  {String} guid - Service GUID
     * @return {Promise} Resolves with JSON service
     */
    getService(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/service_instances/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/user_provided_service_instances/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Create a user-provided service
     * v2: {@link http://apidocs.cloudfoundry.org/217/user_provided_service_instances/creating_a_user_provided_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#create-a-service-instance}
     *
     * @param  {Object} upsOptions - User provided service options
     * @return {Promise} Resolves with JSON response
     */
    add(upsOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const body = Object.assign({ type: "user-provided" }, upsOptions);
            return this.REST.requestV3("POST", `${this.API_URL}/v3/service_instances`, token, body, this.HttpStatus.CREATED);
        }
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/user_provided_service_instances`,
            headers: { Authorization: token },
            form: JSON.stringify(upsOptions)
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Remove a user-provided service
     * v2: {@link http://apidocs.cloudfoundry.org/217/user_provided_service_instances/delete_a_particular_user_provided_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-service-instance}
     *
     * @param  {String} guid - Service GUID
     * @return {Promise} Resolves with response
     */
    remove(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("DELETE", `${this.API_URL}/v3/service_instances/${guid}`, token, null, this.HttpStatus.NO_CONTENT);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/user_provided_service_instances/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * Get service bindings for a user-provided service
     * v2: {@link http://apidocs.cloudfoundry.org/221/user_provided_service_instances/list_all_service_bindings_for_the_user_provided_service_instance.html}
     * v3: Uses /v3/service_credential_bindings with service_instance_guids filter
     *
     * @param  {String} guid - Service GUID
     * @param  {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON bindings list
     */
    getServiceBindings(guid, filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const qs = Object.assign({ service_instance_guids: guid }, filter || {});
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/service_credential_bindings`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: qs,
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/user_provided_service_instances/${guid}/service_bindings`,
            headers: { Authorization: token },
            qs: filter || {}
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

}

module.exports = UserProvidedServices;
