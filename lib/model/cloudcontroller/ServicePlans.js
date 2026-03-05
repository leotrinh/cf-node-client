"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manages Service Plans on Cloud Foundry.
 * Supports both CF API v2 and v3 with automatic version routing.
 *
 * NOTE: V3 methods that need query-string filters use this.REST.request() with
 * manual headers + qs, while simple v3 calls use this.REST.requestV3().
 * This is because requestV3() does not support the qs parameter.
 *
 * @class
 */
class ServicePlans extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get Service Plans
     * v2: {@link https://apidocs.cloudfoundry.org/226/service_plans/list_all_service_plans.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-service-plans}
     *
     * @param  {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON service plans list
     */
    getServicePlans(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/service_plans`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {},
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/service_plans`,
            headers: { Authorization: token },
            qs: filter || {}
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single Service Plan by GUID
     * v2: {@link https://apidocs.cloudfoundry.org/226/service_plans/retrieve_a_particular_service_plan.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-service-plan}
     *
     * @param  {String} guid - Service plan GUID
     * @return {Promise} Resolves with JSON service plan
     */
    getServicePlan(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/service_plans/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/service_plans/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * List all Service Instances for a Service Plan
     * v2: {@link https://apidocs.cloudfoundry.org/226/service_plans/list_all_service_instances_for_the_service_plan.html}
     * v3: Uses /v3/service_instances with service_plan_guids filter
     *
     * @param  {String} guid - Service plan GUID
     * @return {Promise} Resolves with JSON service instances list
     */
    getServicePlanInstances(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/service_instances`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: { service_plan_guids: guid },
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/service_plans/${guid}/service_instances`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Remove a Service Plan
     * v2: {@link https://apidocs.cloudfoundry.org/226/service_plans/delete_a_particular_service_plans.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-service-plan}
     *
     * @param  {String} guid - Service plan GUID
     * @return {Promise} Resolves with response
     */
    remove(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("DELETE", `${this.API_URL}/v3/service_plans/${guid}`, token, null, this.HttpStatus.NO_CONTENT);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/service_plans/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

}

module.exports = ServicePlans;
