"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage Services on Cloud Foundry
 * Supports both Cloud Foundry API v2 and v3
 */
class Services extends CloudControllerBase {

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
     * Get Services (supports both v2 and v3)
     * v2: {@link http://apidocs.cloudfoundry.org/214/services/list_all_services.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-service-offerings}
     *
     * @param {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to services list]
     */
    getServices(filter) {
        if (this.isUsingV3()) {
            return this._getServicesV3(filter);
        } else {
            return this._getServicesV2(filter);
        }
    }

    _getServicesV2(filter) {
        const url = `${this.API_URL}/v2/services`;
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

    _getServicesV3(filter) {
        const url = `${this.API_URL}/v3/service_offerings`;
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
     * Get a specific Service by GUID
     * v2: {@link http://apidocs.cloudfoundry.org/214/services/retrieve_a_particular_service.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-service-offering}
     *
     * @param  {String} guid [Service GUID]
     * @return {Promise} [Promise resolving to service]
     */
    getService(guid) {
        if (this.isUsingV3()) {
            return this._getServiceV3(guid);
        } else {
            return this._getServiceV2(guid);
        }
    }

    _getServiceV2(guid) {
        const url = `${this.API_URL}/v2/services/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getServiceV3(guid) {
        const url = `${this.API_URL}/v3/service_offerings/${guid}`;
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
     * Get service plans for a Service
     * v2: {@link http://apidocs.cloudfoundry.org/214/services/list_all_service_plans_for_the_service.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-service-plans}
     *
     * @param  {String} guid [Service GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to service plans list]
     */
    getServicePlans(guid, filter) {
        if (this.isUsingV3()) {
            return this._getServicePlansV3(guid, filter);
        } else {
            return this._getServicePlansV2(guid, filter);
        }
    }

    _getServicePlansV2(guid, filter) {
        const url = `${this.API_URL}/v2/services/${guid}/service_plans`;
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

    _getServicePlansV3(guid, filter) {
        const qs = Object.assign({}, filter || {});
        qs["service_offering_guids"] = guid;

        const url = `${this.API_URL}/v3/service_plans`;
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
     * Enable a Service for a particular organization (v2 only)
     * {@link http://apidocs.cloudfoundry.org/214/services/enable_a_purchased_service_for_a_particular_organization.html}
     *
     * @param  {String} serviceGuid [Service GUID]
     * @param  {String} orgGuid [Organization GUID]
     * @return {Promise} [Promise resolving to enabled service]
     */
    enableServiceForOrganization(serviceGuid, orgGuid) {
        if (this.isUsingV3()) {
            throw new Error("enableServiceForOrganization is not available in Cloud Foundry API v3. Consider using service offerings visibility in v3.");
        }
        return this._enableServiceForOrganizationV2(serviceGuid, orgGuid);
    }

    _enableServiceForOrganizationV2(serviceGuid, orgGuid) {
        const url = `${this.API_URL}/v2/services/${serviceGuid}/organizations/${orgGuid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify({})
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Disable a Service for a particular organization (v2 only)
     * {@link http://apidocs.cloudfoundry.org/214/services/disable_a_purchased_service_for_a_particular_organization.html}
     *
     * @param  {String} serviceGuid [Service GUID]
     * @param  {String} orgGuid [Organization GUID]
     * @return {Promise} [Promise resolving to delete result]
     */
    disableServiceForOrganization(serviceGuid, orgGuid) {
        if (this.isUsingV3()) {
            throw new Error("disableServiceForOrganization is not available in Cloud Foundry API v3. Consider using service offerings visibility in v3.");
        }
        return this._disableServiceForOrganizationV2(serviceGuid, orgGuid);
    }

    _disableServiceForOrganizationV2(serviceGuid, orgGuid) {
        const url = `${this.API_URL}/v2/services/${serviceGuid}/organizations/${orgGuid}`;
        const options = {
            method: "DELETE",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

}

module.exports = Services;
