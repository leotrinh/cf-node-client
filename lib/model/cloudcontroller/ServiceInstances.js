"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage Service Instances on Cloud Foundry
 * Supports both Cloud Foundry API v2 and v3
 */
class ServiceInstances extends CloudControllerBase {

    /**
     * @param {String} endPoint [CC endpoint]
     * @param {Object} options [Configuration options]
     * @constructor
     * @returns {void}
     */
    constructor(endPoint, options) {
        super(endPoint, options);
    }

    /**
     * Get Service Instances (supports both v2 and v3)
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/list_all_service_instances.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-service-instances}
     *
     * @param {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to service instances list]
     */
    getInstances(filter) {
        if (this.isUsingV3()) {
            return this._getInstancesV3(filter);
        } else {
            return this._getInstancesV2(filter);
        }
    }

    _getInstancesV2(filter) {
        const url = `${this.API_URL}/v2/service_instances`;
        let qs = filter || {};
        
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            qs: qs
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getInstancesV3(filter) {
        const url = `${this.API_URL}/v3/service_instances`;
        let qs = filter || {};

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            qs: qs,
            json: true
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a Service Instance by GUID
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/retrieve_a_particular_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-service-instance}
     *
     * @param  {String} guid [Service Instance GUID]
     * @return {Promise} [Promise resolving to service instance]
     */
    getInstance(guid) {
        if (this.isUsingV3()) {
            return this._getInstanceV3(guid);
        } else {
            return this._getInstanceV2(guid);
        }
    }

    _getInstanceV2(guid) {
        const url = `${this.API_URL}/v2/service_instances/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getInstanceV3(guid) {
        const url = `${this.API_URL}/v3/service_instances/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: true
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get Service Instance Permissions (v2 only)
     * {@link http://apidocs.cloudfoundry.org/226/service_instances/retrieving_permissions_on_a_service_instance.html}
     *
     * @param  {String} guid [Service Instance GUID]
     * @return {Promise} [Promise resolving to permissions]
     */
    getInstancePermissions(guid) {
        if (this.isUsingV3()) {
            throw new Error("getInstancePermissions is not available in Cloud Foundry API v3. Use v2 API for this operation.");
        }
        return this._getInstancePermissionsV2(guid);
    }

    _getInstancePermissionsV2(guid) {
        const url = `${this.API_URL}/v2/service_instances/${guid}/permissions`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Create a Service Instance
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/create_a_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#create-a-service-instance}
     *
     * @param {Object} instanceOptions [Service Instance options]
     * @return {Promise} [Promise resolving to created service instance]
     */
    add(instanceOptions) {
        if (this.isUsingV3()) {
            return this._addV3(instanceOptions);
        } else {
            return this._addV2(instanceOptions);
        }
    }

    _addV2(instanceOptions) {
        const url = `${this.API_URL}/v2/service_instances`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(instanceOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    _addV3(instanceOptions) {
        const url = `${this.API_URL}/v3/service_instances`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: instanceOptions
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update a Service Instance
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/updating_a_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-a-service-instance}
     *
     * @param  {String} guid [Service Instance GUID]
     * @param  {Object} instanceOptions [Service Instance options]
     * @return {Promise} [Promise resolving to updated service instance]
     */
    update(guid, instanceOptions) {
        if (this.isUsingV3()) {
            return this._updateV3(guid, instanceOptions);
        } else {
            return this._updateV2(guid, instanceOptions);
        }
    }

    _updateV2(guid, instanceOptions) {
        const url = `${this.API_URL}/v2/service_instances/${guid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(instanceOptions)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _updateV3(guid, instanceOptions) {
        const url = `${this.API_URL}/v3/service_instances/${guid}`;
        const options = {
            method: "PATCH",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: instanceOptions
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete a Service Instance
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/delete_a_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-service-instance}
     *
     * @param  {String} guid [Service Instance GUID]
     * @param  {Object} deleteOptions [Delete options]
     * @return {Promise} [Promise resolving to delete result]
     */
    remove(guid, deleteOptions) {
        if (this.isUsingV3()) {
            return this._removeV3(guid, deleteOptions);
        } else {
            return this._removeV2(guid, deleteOptions);
        }
    }

    _removeV2(guid, deleteOptions) {
        const url = `${this.API_URL}/v2/service_instances/${guid}`;
        let qs = deleteOptions || {};

        const options = {
            method: "DELETE",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            qs: qs
        };

        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    _removeV3(guid, deleteOptions) {
        const url = `${this.API_URL}/v3/service_instances/${guid}`;
        let qs = deleteOptions || {};

        const options = {
            method: "DELETE",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            qs: qs
        };

        return this.REST.request(options, this.HttpStatus.ACCEPTED, true);
    }

    /**
     * Get service bindings for a Service Instance
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/list_all_service_bindings_for_the_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-service-credential-bindings}
     *
     * @param  {String} guid [Service Instance GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to service bindings list]
     */
    getServiceBindings(guid, filter) {
        if (this.isUsingV3()) {
            return this._getServiceBindingsV3(guid, filter);
        } else {
            return this._getServiceBindingsV2(guid, filter);
        }
    }

    _getServiceBindingsV2(guid, filter) {
        const url = `${this.API_URL}/v2/service_instances/${guid}/service_bindings`;
        let qs = filter || {};

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            qs: qs
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getServiceBindingsV3(guid, filter) {
        let qs = filter || {};
        qs["service_instance_guids"] = guid;

        const url = `${this.API_URL}/v3/service_credential_bindings`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            qs: qs,
            json: true
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

}

module.exports = ServiceInstances;
