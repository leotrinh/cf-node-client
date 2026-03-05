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
     * Get information from Cloud Controller.
     *
     * v2: {@link http://apidocs.cloudfoundry.org/214/info/get_info.html}
     * v3: Uses the root endpoint (/) — CF v3 has no /v3/info.
     *     The response is **normalized** so that `authorization_endpoint`
     *     and `token_endpoint` are always present at the top level,
     *     keeping backward compatibility with existing consumer code.
     *
     * @return {Promise} Resolves with JSON info (always contains
     *                   `authorization_endpoint` and `token_endpoint`)
     */
    getInfo() {
        if (this.isUsingV3()) {
            // CF v3: root endpoint "/" returns { links: { uaa: {href}, login: {href}, … } }
            const options = {
                method: "GET",
                url: `${this.API_URL}/`,
                headers: { Accept: "application/json" }
            };
            return this.REST.request(options, this.HttpStatus.OK, true)
                .then(function (result) {
                    // Normalize: add v2-style fields for backward compatibility
                    if (result && result.links) {
                        if (result.links.login && result.links.login.href) {
                            result.authorization_endpoint = result.links.login.href;
                        } else if (result.links.uaa && result.links.uaa.href) {
                            result.authorization_endpoint = result.links.uaa.href;
                        }
                        if (result.links.uaa && result.links.uaa.href) {
                            result.token_endpoint = result.links.uaa.href;
                        }
                    }
                    return result;
                });
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/info`
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get the UAA authorization endpoint URL from Cloud Controller info.
     * Works with both v2 and v3 — abstracts away the response shape difference.
     *
     * @return {Promise<String>} Resolves with the authorization endpoint URL
     * @throws {Error} If authorization endpoint is not found in the info response
     */
    getAuthorizationEndpoint() {
        return this.getInfo().then(function (info) {
            const endpoint = info.authorization_endpoint;
            if (!endpoint) {
                throw new Error(
                    "Could not determine authorization_endpoint from CF info response. " +
                    "Ensure the Cloud Controller is reachable and returns valid info."
                );
            }
            return endpoint;
        });
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
