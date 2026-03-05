"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Entry point for the Cloud Foundry Controller.
 * Supports both CF API v2 and v3 with automatic version routing.
 * {@link https://github.com/cloudfoundry/cloud_controller_ng}
 *
 * @class
 */
class CloudController extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get information from Cloud Controller
     * v2: {@link http://apidocs.cloudfoundry.org/214/info/get_info.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-info}
     *
     * @return {Promise} Resolves with JSON info
     */
    getInfo() {
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/info`);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/info`
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get all feature flags
     * v2: {@link http://apidocs.cloudfoundry.org/214/feature_flags/get_all_feature_flags.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-feature-flags}
     *
     * @return {Promise} Resolves with JSON feature flags list
     */
    getFeaturedFlags() {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/feature_flags`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/config/feature_flags`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a specific feature flag
     * v2: {@link http://apidocs.cloudfoundry.org/214/feature_flags/get_the_diego_docker_feature_flag.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-feature-flag}
     *
     * @param  {String} flag - Feature flag name
     * @return {Promise} Resolves with JSON feature flag
     */
    getFeaturedFlag(flag) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/feature_flags/${flag}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/config/feature_flags/${flag}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Enable / set a feature flag
     * v2: {@link http://apidocs.cloudfoundry.org/214/feature_flags/set_a_feature_flag.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-a-feature-flag}
     *
     * @param {String} flag - Feature flag name
     * @param {Object} [flagOptions] - v3 body (e.g. { enabled: true })
     * @return {Promise} Resolves with JSON response
     */
    setFeaturedFlag(flag, flagOptions) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("PATCH", `${this.API_URL}/v3/feature_flags/${flag}`, token, flagOptions);
        }
        const options = {
            method: "PUT",
            url: `${this.API_URL}/v2/config/feature_flags/${flag}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

}

module.exports = CloudController;
