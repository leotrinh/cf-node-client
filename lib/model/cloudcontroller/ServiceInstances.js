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

    /**
     * Find a Service Instance by name using server-side filtering.
     * Returns the first matching resource or null if not found.
     * Optionally filter by space GUID.
     *
     * v2: Uses q=name:{name} filter (and q=space_guid:{spaceGuid} if provided)
     * v3: Uses names={name} filter (and space_guids={spaceGuid} if provided)
     *
     * @param  {String} name [Service Instance name]
     * @param  {String} [spaceGuid] [Optional space GUID to narrow search]
     * @return {Promise} [Promise resolving to service instance resource or null]
     */
    getInstanceByName(name, spaceGuid) {
        if (!name || typeof name !== "string") {
            return Promise.reject(new Error("Service instance name must be a non-empty string."));
        }
        let filter;
        if (this.isUsingV3()) {
            filter = { names: name };
            if (spaceGuid) { filter.space_guids = spaceGuid; }
        } else {
            filter = { q: [`name:${name}`] };
            if (spaceGuid) { filter.q.push(`space_guid:${spaceGuid}`); }
        }
        return this.getInstances(filter).then(result => {
            const resources = result.resources || [];
            return resources.length > 0 ? resources[0] : null;
        });
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
     * @param {Boolean} [acceptsIncomplete=false] [Allow async provisioning]
     * @return {Promise} [Promise resolving to created service instance]
     */
    add(instanceOptions, acceptsIncomplete = false) {
        if (this.isUsingV3()) {
            return this._addV3(instanceOptions, acceptsIncomplete);
        } else {
            return this._addV2(instanceOptions, acceptsIncomplete);
        }
    }

    _addV2(instanceOptions, acceptsIncomplete) {
        const url = `${this.API_URL}/v2/service_instances`;
        const qs = {};
        if (acceptsIncomplete) qs.accepts_incomplete = true;

        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(instanceOptions),
            qs
        };

        // Async provisioning returns 202, sync returns 201
        const expectedStatus = acceptsIncomplete ? this.HttpStatus.ACCEPTED : this.HttpStatus.CREATED;
        return this.REST.request(options, expectedStatus, true);
    }

    _addV3(instanceOptions, acceptsIncomplete) {
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

        // v3 async operations return a job location header
        const expectedStatus = acceptsIncomplete ? this.HttpStatus.ACCEPTED : this.HttpStatus.CREATED;
        return this.REST.request(options, expectedStatus, true);
    }

    /**
     * Update a Service Instance
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/updating_a_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-a-service-instance}
     *
     * @param  {String} guid [Service Instance GUID]
     * @param  {Object} instanceOptions [Service Instance options]
     * @param  {Boolean} [acceptsIncomplete=false] [Allow async update]
     * @return {Promise} [Promise resolving to updated service instance]
     */
    update(guid, instanceOptions, acceptsIncomplete = false) {
        if (this.isUsingV3()) {
            return this._updateV3(guid, instanceOptions, acceptsIncomplete);
        } else {
            return this._updateV2(guid, instanceOptions, acceptsIncomplete);
        }
    }

    _updateV2(guid, instanceOptions, acceptsIncomplete) {
        const url = `${this.API_URL}/v2/service_instances/${guid}`;
        const qs = {};
        if (acceptsIncomplete) qs.accepts_incomplete = true;

        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(instanceOptions),
            qs
        };

        const expectedStatus = acceptsIncomplete ? this.HttpStatus.ACCEPTED : this.HttpStatus.OK;
        return this.REST.request(options, expectedStatus, true);
    }

    _updateV3(guid, instanceOptions, acceptsIncomplete) {
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

        const expectedStatus = acceptsIncomplete ? this.HttpStatus.ACCEPTED : this.HttpStatus.OK;
        return this.REST.request(options, expectedStatus, true);
    }

    /**
     * Delete a Service Instance
     * v2: {@link http://apidocs.cloudfoundry.org/226/service_instances/delete_a_service_instance.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-service-instance}
     *
     * @param  {String} guid [Service Instance GUID]
     * @param  {Object} [deleteOptions] [Delete options]
     * @param  {Boolean} [acceptsIncomplete=false] [Allow async deletion]
     * @return {Promise} [Promise resolving to delete result]
     */
    remove(guid, deleteOptions, acceptsIncomplete = false) {
        if (this.isUsingV3()) {
            return this._removeV3(guid, deleteOptions, acceptsIncomplete);
        } else {
            return this._removeV2(guid, deleteOptions, acceptsIncomplete);
        }
    }

    _removeV2(guid, deleteOptions, acceptsIncomplete) {
        const url = `${this.API_URL}/v2/service_instances/${guid}`;
        let qs = deleteOptions || {};
        if (acceptsIncomplete) qs.accepts_incomplete = true;

        const options = {
            method: "DELETE",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            qs: qs
        };

        const expectedStatus = acceptsIncomplete ? this.HttpStatus.ACCEPTED : this.HttpStatus.NO_CONTENT;
        const jsonOutput = acceptsIncomplete; // async returns JSON job info
        return this.REST.request(options, expectedStatus, jsonOutput);
    }

    /**
     * Remove a service instance (v3 path).
     * Managed service instance deletion returns 202 (async job).
     * User-provided service instance deletion returns 204 (sync, no body).
     * The acceptsIncomplete parameter is accepted for API compatibility with the v2
     * code path but has no effect — v3 always behaves as if acceptsIncomplete=true.
     * @private
     */
    _removeV3(guid, deleteOptions, acceptsIncomplete) {
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

        // Managed returns 202 (async job); UPS returns 204 (sync, no body)
        return this.REST.request(options, [this.HttpStatus.ACCEPTED, this.HttpStatus.NO_CONTENT], false);
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
        const qs = Object.assign({}, filter || {});
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

    // --- Space-scoped queries (Issue #47) ---

    /**
     * Get Service Instances filtered by Space GUID.
     *
     * @param {String} spaceGuid [Space GUID]
     * @param {Object} [filter] [Additional filter options]
     * @return {Promise} [Service instances in the space]
     */
    getInstancesBySpace(spaceGuid, filter) {
        if (this.isUsingV3()) {
            const qs = filter || {};
            qs.space_guids = spaceGuid;
            const url = `${this.API_URL}/v3/service_instances`;
            const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
            const options = {
                method: "GET",
                url: url,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        } else {
            const qs = filter || {};
            const url = `${this.API_URL}/v2/spaces/${spaceGuid}/service_instances`;
            const options = {
                method: "GET",
                url: url,
                headers: { Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}` },
                qs
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
    }

    /**
     * Get a Service Instance by name within a specific Space.
     *
     * @param {String} name [Service Instance name]
     * @param {String} spaceGuid [Space GUID]
     * @return {Promise} [Service instance matching name in space]
     */
    getInstanceByNameInSpace(name, spaceGuid) {
        if (this.isUsingV3()) {
            const url = `${this.API_URL}/v3/service_instances`;
            const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
            const options = {
                method: "GET",
                url: url,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: { names: name, space_guids: spaceGuid }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        } else {
            const url = `${this.API_URL}/v2/spaces/${spaceGuid}/service_instances`;
            const options = {
                method: "GET",
                url: url,
                headers: { Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}` },
                qs: { q: `name:${name}` }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
    }

    // --- HANA/Managed Instance lifecycle (Issue #199) ---

    /**
     * Start a managed Service Instance (v3 only).
     * Used for HANA and other stoppable managed services on SAP BTP.
     *
     * @param {String} guid [Service Instance GUID]
     * @return {Promise} [Resolves with operation job or updated instance]
     */
    startInstance(guid) {
        if (!this.isUsingV3()) {
            throw new Error("startInstance requires Cloud Foundry API v3.");
        }
        const url = `${this.API_URL}/v3/service_instances/${guid}`;
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const data = { metadata: { annotations: { "state": "started" } } };
        return this.REST.requestV3("PATCH", url, token, data, this.HttpStatus.OK);
    }

    /**
     * Stop a managed Service Instance (v3 only).
     * Used for HANA and other stoppable managed services on SAP BTP.
     *
     * @param {String} guid [Service Instance GUID]
     * @return {Promise} [Resolves with operation job or updated instance]
     */
    stopInstance(guid) {
        if (!this.isUsingV3()) {
            throw new Error("stopInstance requires Cloud Foundry API v3.");
        }
        const url = `${this.API_URL}/v3/service_instances/${guid}`;
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const data = { metadata: { annotations: { "state": "stopped" } } };
        return this.REST.requestV3("PATCH", url, token, data, this.HttpStatus.OK);
    }

    /**
     * Get the last operation status for a Service Instance.
     * Useful for polling async operations (accepts_incomplete).
     *
     * @param {String} guid [Service Instance GUID]
     * @return {Promise} [Resolves with last_operation object]
     */
    getOperationStatus(guid) {
        if (this.isUsingV3()) {
            const url = `${this.API_URL}/v3/service_instances/${guid}`;
            const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
            return this.REST.requestV3("GET", url, token).then(instance => {
                return instance.last_operation || {};
            });
        } else {
            const url = `${this.API_URL}/v2/service_instances/${guid}`;
            const options = {
                method: "GET",
                url: url,
                headers: { Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}` }
            };
            return this.REST.request(options, this.HttpStatus.OK, true).then(result => {
                return (result.entity && result.entity.last_operation) || {};
            });
        }
    }

    /**
     * Get ALL service instances across all pages (auto-pagination).
     * Returns a flat array of every service instance resource.
     *
     * Results are cached when caching is enabled.
     *
     * @param  {Object} [filter] Base filter (merged with pagination params)
     * @return {Promise<Array>} Flat array of all service instance resources
     */
    getAllInstances(filter) {
        const self = this;
        return this.getAllResources(function (f) { return self.getInstances(f); }, filter);
    }

}

module.exports = ServiceInstances;
