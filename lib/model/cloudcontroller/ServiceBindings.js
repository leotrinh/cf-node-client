"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage Service Bindings on Cloud Foundry
 * Supports both Cloud Foundry API v2 and v3
 */
class ServiceBindings extends CloudControllerBase {

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
     * Get Service Bindings (supports both v2 and v3)
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_bindings/list_all_service_bindings.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-service-credential-bindings}
     *
     * @param {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to service bindings list]
     */
    getServiceBindings(filter) {
        if (this.isUsingV3()) {
            return this._getServiceBindingsV3(filter);
        } else {
            return this._getServiceBindingsV2(filter);
        }
    }

    _getServiceBindingsV2(filter) {
        const url = `${this.API_URL}/v2/service_bindings`;
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

    _getServiceBindingsV3(filter) {
        const url = `${this.API_URL}/v3/service_credential_bindings`;
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
     * Get a Service Binding by GUID
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_bindings/retrieve_a_particular_service_binding.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-service-credential-binding}
     *
     * @param  {String} guid [Service Binding GUID]
     * @return {Promise} [Promise resolving to service binding]
     */
    getServiceBinding(guid) {
        if (this.isUsingV3()) {
            return this._getServiceBindingV3(guid);
        } else {
            return this._getServiceBindingV2(guid);
        }
    }

    _getServiceBindingV2(guid) {
        const url = `${this.API_URL}/v2/service_bindings/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getServiceBindingV3(guid) {
        const url = `${this.API_URL}/v3/service_credential_bindings/${guid}`;
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
     * Create a Service Binding
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_bindings/create_a_service_binding.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#create-a-service-credential-binding}
     *
     * @param {Object} bindingOptions [Service Binding options]
     * @return {Promise} [Promise resolving to created service binding]
     */
    add(bindingOptions) {
        if (this.isUsingV3()) {
            return this._addV3(bindingOptions);
        } else {
            return this._addV2(bindingOptions);
        }
    }

    _addV2(bindingOptions) {
        const url = `${this.API_URL}/v2/service_bindings`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(bindingOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    _addV3(bindingOptions) {
        const url = `${this.API_URL}/v3/service_credential_bindings`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: bindingOptions
        };

        // Key/UPS bindings return 201 (sync); managed bindings return 202 (async job)
        return this.REST.request(options, [this.HttpStatus.CREATED, this.HttpStatus.ACCEPTED], true);
    }

    /**
     * Update a Service Binding
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_bindings/updating_a_service_binding.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-a-service-credential-binding}
     *
     * @param  {String} guid [Service Binding GUID]
     * @param  {Object} bindingOptions [Service Binding options]
     * @return {Promise} [Promise resolving to updated service binding]
     */
    update(guid, bindingOptions) {
        if (this.isUsingV3()) {
            return this._updateV3(guid, bindingOptions);
        } else {
            return this._updateV2(guid, bindingOptions);
        }
    }

    _updateV2(guid, bindingOptions) {
        const url = `${this.API_URL}/v2/service_bindings/${guid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(bindingOptions)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _updateV3(guid, bindingOptions) {
        const url = `${this.API_URL}/v3/service_credential_bindings/${guid}`;
        const options = {
            method: "PATCH",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: bindingOptions
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete a Service Binding
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_bindings/delete_a_service_binding.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-service-credential-binding}
     *
     * @param  {String} guid [Service Binding GUID]
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
        const url = `${this.API_URL}/v2/service_bindings/${guid}`;
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
        const url = `${this.API_URL}/v3/service_credential_bindings/${guid}`;
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

        // Managed bindings return 202 (async job); key/UPS bindings return 204 (sync)
        return this.REST.request(options, [this.HttpStatus.ACCEPTED, this.HttpStatus.NO_CONTENT], false);
    }

}

module.exports = ServiceBindings;
