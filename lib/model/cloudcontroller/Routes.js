"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage Routes on Cloud Foundry
 * Supports both Cloud Foundry API v2 and v3
 */
class Routes extends CloudControllerBase {

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
     * Get Routes (supports both v2 and v3)
     * v2: {@link http://apidocs.cloudfoundry.org/214/routes/list_all_routes.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-routes}
     *
     * @param {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to routes list]
     */
    getRoutes(filter) {
        if (this.isUsingV3()) {
            return this._getRoutesV3(filter);
        } else {
            return this._getRoutesV2(filter);
        }
    }

    _getRoutesV2(filter) {
        const url = `${this.API_URL}/v2/routes`;
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

    _getRoutesV3(filter) {
        const url = `${this.API_URL}/v3/routes`;
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
     * Get a specific Route by GUID
     * v2: {@link http://apidocs.cloudfoundry.org/214/routes/retrieve_a_particular_route.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-route}
     *
     * @param  {String} guid [Route GUID]
     * @return {Promise} [Promise resolving to route]
     */
    getRoute(guid) {
        if (this.isUsingV3()) {
            return this._getRouteV3(guid);
        } else {
            return this._getRouteV2(guid);
        }
    }

    _getRouteV2(guid) {
        const url = `${this.API_URL}/v2/routes/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getRouteV3(guid) {
        const url = `${this.API_URL}/v3/routes/${guid}`;
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
     * Create a new Route
     * v2: {@link http://apidocs.cloudfoundry.org/214/routes/creating_a_route.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#create-a-route}
     *
     * @param {Object} routeOptions [Route options]
     * @return {Promise} [Promise resolving to created route]
     */
    add(routeOptions) {
        if (this.isUsingV3()) {
            return this._addV3(routeOptions);
        } else {
            return this._addV2(routeOptions);
        }
    }

    _addV2(routeOptions) {
        const url = `${this.API_URL}/v2/routes`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(routeOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    _addV3(routeOptions) {
        const url = `${this.API_URL}/v3/routes`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: routeOptions
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update a Route
     * v2: {@link http://apidocs.cloudfoundry.org/214/routes/updating_a_route.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-a-route}
     *
     * @param  {String} guid [Route GUID]
     * @param  {Object} routeOptions [Route options]
     * @return {Promise} [Promise resolving to updated route]
     */
    update(guid, routeOptions) {
        if (this.isUsingV3()) {
            return this._updateV3(guid, routeOptions);
        } else {
            return this._updateV2(guid, routeOptions);
        }
    }

    _updateV2(guid, routeOptions) {
        const url = `${this.API_URL}/v2/routes/${guid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(routeOptions)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _updateV3(guid, routeOptions) {
        const url = `${this.API_URL}/v3/routes/${guid}`;
        const options = {
            method: "PATCH",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: routeOptions
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete a Route
     * v2: {@link http://apidocs.cloudfoundry.org/214/routes/delete_a_route.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-route}
     *
     * @param  {String} guid [Route GUID]
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
        const url = `${this.API_URL}/v2/routes/${guid}`;
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
        const url = `${this.API_URL}/v3/routes/${guid}`;
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
     * Get apps associated with a Route
     * v2: {@link http://apidocs.cloudfoundry.org/214/routes/list_all_apps_for_the_route.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-route-destinations}
     *
     * @param  {String} guid [Route GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to apps list]
     */
    getApps(guid, filter) {
        if (this.isUsingV3()) {
            return this._getAppsV3(guid, filter);
        } else {
            return this._getAppsV2(guid, filter);
        }
    }

    _getAppsV2(guid, filter) {
        const url = `${this.API_URL}/v2/routes/${guid}/apps`;
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

    _getAppsV3(guid, filter) {
        const url = `${this.API_URL}/v3/routes/${guid}/destinations`;
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

}

module.exports = Routes;
