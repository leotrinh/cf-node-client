"use strict";

const CloudControllerBase = require("./CloudControllerBase");
const rest = require("restler");//TODO: Analyze a way to remove this dependency
const fs = require("fs");

/**
 * This public class manages the operations related with Applications on Cloud Controller.
 * Supports both Cloud Foundry API v2 and v3 (default: v3)
 */
class Apps extends CloudControllerBase {

    /**
     * Returns all applications.
     * v2: {@link http://apidocs.cloudfoundry.org/213/apps/list_all_apps.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#list-apps}
     *
     * @param  {JSON} filter [Search options]
     * @return {JSON}        [return a JSON response]
     */

    getApps(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const url = this.buildResourceUrl("apps");
            let qs = filter || {};
            const options = {
                method: "GET",
                url: url,
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json"
                },
                qs: qs
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        } else {
            const url = `${this.API_URL}/v2/apps`;
            let qs = filter || {};
            const options = {
                method: "GET",
                url: url,
                headers: {
                    Authorization: token
                },
                qs: qs
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
    }

    /**
     * Get a specific application by GUID
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#get-an-app}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Application information]
     */

    getApp(appGuid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const url = this.buildResourceUrl("apps", appGuid);
            const options = {
                method: "GET",
                url: url,
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json"
                }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        } else {
            const url = `${this.API_URL}/v2/apps/${appGuid}`;
            const options = {
                method: "GET",
                url: url,
                headers: {
                    Authorization: token
                }
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
    }

    /**
     * Creates a new application on Cloud Controller.
     * v2: {@link http://apidocs.cloudfoundry.org/214/apps/creating_an_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#create-an-app}
     *
     * @example
     * // v2 format:
     * var appOptions = {
     *     "name": name,
     *     "space_guid": space_guid,
     *     "buildpack": buildPack
     * }
     *
     * // v3 format:
     * var appOptions = {
     *     "name": name,
     *     "relationships": {
     *         "space": {
     *             "data": { "guid": space_guid }
     *         }
     *     }
     * }
     *
     * @param  {JSON} appOptions [options to create the application]
     * @return {JSON}            [information about the application]
     */
    add (appOptions) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            return this._addV3(appOptions, token);
        } else {
            return this._addV2(appOptions, token);
        }
    }

    /**
     * Create app using v2 API
     * @private
     */
    _addV2(appOptions, token) {
        const url = `${this.API_URL}/v2/apps`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: token
            },
            form: JSON.stringify(appOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Create app using v3 API
     * @private
     */
    _addV3(appOptions, token) {
        const url = this.buildResourceUrl("apps");
        const options = {
            method: "POST",
            url: url,
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(appOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update an App
     * v2: {@link http://apidocs.cloudfoundry.org/217/apps/updating_an_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#update-an-app}
     *
     * @param  {String} appGuid     [App guid]
     * @param  {JSON} appOptions   [options to update the application]
     * @return {JSON}              [information about the application]
     */
    update (appGuid, appOptions) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            return this._updateV3(appGuid, appOptions, token);
        } else {
            return this._updateV2(appGuid, appOptions, token);
        }
    }

    /**
     * Update app using v2 API
     * @private
     */
    _updateV2(appGuid, appOptions, token) {
        const url = `${this.API_URL}/v2/apps/${appGuid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: token
            },
            form: JSON.stringify(appOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update app using v3 API
     * @private
     */
    _updateV3(appGuid, appOptions, token) {
        const url = this.buildResourceUrl("apps", appGuid);
        const options = {
            method: "PATCH",
            url: url,
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            },
            body: JSON.stringify(appOptions)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Stop an App
     * v2: {@link http://apidocs.cloudfoundry.org/217/apps/updating_an_app.html}
     * v3: Updates the app with stopped: true
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [information about the application]
     */
    stop (appGuid) {
        if (this.isUsingV3()) {
            // v3 uses stopped field instead of state
            return this.update(appGuid, { stopped: true });
        } else {
            // v2 uses state field
            return this.update(appGuid, { state: "STOPPED" });
        }
    }

    /**
     * Start an App
     * v2: {@link http://apidocs.cloudfoundry.org/217/apps/updating_an_app.html}
     * v3: Updates the app with stopped: false
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [information about the application]
     */
    start (appGuid) {
        if (this.isUsingV3()) {
            // v3 uses stopped field instead of state
            return this.update(appGuid, { stopped: false });
        } else {
            // v2 uses state field
            return this.update(appGuid, { state: "STARTED" });
        }
    }

    /**
     * Restart an App
     * Stops and then starts the application
     *
     * @param  {String} appGuid [App guid]
     * @return {Promise}        [stop then start]
     */
    restart(appGuid) {
        return this.stop(appGuid).then(() => this.start(appGuid));
    }

    /**
     * Get summary about an application (v2 only)
     * {@link http://apidocs.cloudfoundry.org/214/apps/get_app_summary.html}
     * Note: v3 doesn't have a summary endpoint; use getApp instead
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [information about the application]
     */
    getSummary (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            // For v3, return the app info as it already includes relevant data
            return this.getApp(appGuid);
        }

        const url = `${this.API_URL}/v2/apps/${appGuid}/summary`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete an App
     * v2: {@link http://apidocs.cloudfoundry.org/214/apps/delete_a_particular_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#delete-an-app}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [response]
     */
    remove (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            return this._removeV3(appGuid, token);
        } else {
            return this._removeV2(appGuid, token);
        }
    }

    /**
     * Remove app using v2 API
     * @private
     */
    _removeV2(appGuid, token) {
        const url = `${this.API_URL}/v2/apps/${appGuid}`;
        const options = {
            method: "DELETE",
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * Remove app using v3 API
     * @private
     */
    _removeV3(appGuid, token) {
        const url = this.buildResourceUrl("apps", appGuid);
        const options = {
            method: "DELETE",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * Get stats from an App (v2 only)
     * {@link http://apidocs.cloudfoundry.org/214/apps/get_detailed_stats_for_a_started_app.html}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [statistics]
     */
    getStats (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        // v3 uses a different endpoint (/v3/stats)
        const url = this.isUsingV3() 
            ? `${this.API_URL}/v3/apps/${appGuid}/stats`
            : `${this.API_URL}/v2/apps/${appGuid}/stats`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Associate an Application with a Route.
     * v2: {@link http://apidocs.cloudfoundry.org/214/apps/associate_route_with_the_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#create-a-route}
     *
     * @param  {String} appGuid [App guid]
     * @param  {String} routeGuid [Route guid]
     * @return {JSON}            [response]
     */
    associateRoute (appGuid, routeGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            return this._associateRouteV3(appGuid, routeGuid, token);
        } else {
            return this._associateRouteV2(appGuid, routeGuid, token);
        }
    }

    /**
     * Associate route using v2 API
     * @private
     */
    _associateRouteV2(appGuid, routeGuid, token) {
        const url = `${this.API_URL}/v2/apps/${appGuid}/routes/${routeGuid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Associate route using v3 API
     * @private
     */
    _associateRouteV3(appGuid, routeGuid, token) {
        // In v3, the association uses PATCH to the app's routes
        const url = `${this.API_URL}/v3/apps/${appGuid}/routes/${routeGuid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: token,
                "Content-Type": "application/json"
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Upload source code
     * v2: {@link http://apidocs.cloudfoundry.org/214/apps/uploads_the_bits_for_an_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#create-a-package}
     *
     * @param  {String} appGuid [App guid]
     * @param  {String} filePath [file path to upload]
     * @param  {Boolean} async [Sync/Async]
     * @return {JSON/String}    [{}/Job information or package information]
     */
    upload (appGuid, filePath, async) {
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const zipResources = [];
        let asyncFlag = false;

        if (typeof async === "boolean" && async) {
            asyncFlag = true;
        }

        if (this.isUsingV3()) {
            return this._uploadV3(appGuid, filePath, fileSizeInBytes, asyncFlag);
        } else {
            return this._uploadV2(appGuid, filePath, fileSizeInBytes, asyncFlag);
        }
    }

    /**
     * Upload app bits using v2 API
     * @private
     */
    _uploadV2(appGuid, filePath, fileSizeInBytes, asyncFlag) {
        const url = `${this.API_URL}/v2/apps/${appGuid}/bits`;
        const zipResources = [];

        const options = {
            multipart: true,
            accessToken: this.UAA_TOKEN.access_token,
            query: {
                guid: appGuid,
                async: asyncFlag
            },
            data: {
                resources: JSON.stringify(zipResources),
                application: rest.file(filePath, null, fileSizeInBytes, null, "application/zip")
            }
        };

        return this.REST.upload(url, options, this.HttpStatus.CREATED, false);
    }

    /**
     * Upload app bits using v3 API
     * @private
     */
    _uploadV3(appGuid, filePath, fileSizeInBytes, asyncFlag) {
        const url = `${this.API_URL}/v3/apps/${appGuid}/packages`;
        const zipResources = [];

        const options = {
            multipart: true,
            accessToken: this.UAA_TOKEN.access_token,
            query: {
                guid: appGuid,
                async: asyncFlag
            },
            data: {
                type: "bits",
                data: rest.file(filePath, null, fileSizeInBytes, null, "application/zip")
            }
        };

        return this.REST.upload(url, options, this.HttpStatus.CREATED, false);
    }

    /**
     * Get Instances
     * v2: {@link http://apidocs.cloudfoundry.org/215/apps/get_the_instance_information_for_a_started_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#list-app-instances}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Instance information]
     */
    getInstances (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/instances`
            : `${this.API_URL}/v2/apps/${appGuid}/instances`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get routes from an App
     * v2: {@link http://apidocs.cloudfoundry.org/214/apps/list_all_routes_for_the_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#list-routes-for-an-app}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Routes]
     */
    getAppRoutes (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/routes`
            : `${this.API_URL}/v2/apps/${appGuid}/routes`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get Service Bindings from an App
     * v2: {@link http://apidocs.cloudfoundry.org/221/apps/list_all_service_bindings_for_the_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#list-service-credential-bindings}
     *
     * @param  {String} appGuid [App guid]
     * @param  {String} filter [search options]
     * @return {JSON}           [Service Bindings]
     */
    getServiceBindings (appGuid, filter) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/service_credential_bindings`
            : `${this.API_URL}/v2/apps/${appGuid}/service_bindings`;

        let qs = filter || {};

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            },
            qs: qs
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Remove a Service Binding from an App.
     * v2: {@link http://apidocs.cloudfoundry.org/226/apps/remove_service_binding_from_the_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#delete-a-service-credential-binding}
     *
     * @param  {String} appGuid [App guid]
     * @param  {String} serviceBindingGuid [Service Binding guid]
     * @return {JSON}                      [Response]
     */
    removeServiceBindings (appGuid, serviceBindingGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/service_credential_bindings/${serviceBindingGuid}`
            : `${this.API_URL}/v2/apps/${appGuid}/service_bindings/${serviceBindingGuid}`;

        const options = {
            method: "DELETE",
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }

    /**
     * Get environment variables
     * v2: {@link http://apidocs.cloudfoundry.org/222/apps/get_the_env_for_an_app.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#get-environment-variables-for-an-app}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Environment variables]
     */
    getEnvironmentVariables (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/apps/${appGuid}/environment_variables`
            : `${this.API_URL}/v2/apps/${appGuid}/env`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Set environment variables for an app
     * v2: Updates full app object
     * v3: PATCH to environment_variables endpoint
     *
     * @param  {String} appGuid [App guid]
     * @param  {JSON} variables [Environment variables to set]
     * @return {JSON}           [Response]
     */
    setEnvironmentVariables(appGuid, variables) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            const url = `${this.API_URL}/v3/apps/${appGuid}/environment_variables`;
            const options = {
                method: "PATCH",
                url: url,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token
                },
                body: JSON.stringify({ var: variables })
            };

            return this.REST.request(options, this.HttpStatus.OK, true);
        } else {
            return this.update(appGuid, { environment_json: variables });
        }
    }

    /**
     * Restage an Application (v2 only)
     * {@link http://apidocs.cloudfoundry.org/222/apps/restage_an_app.html}
     * Note: In v3, staging is triggered by setting `current_droplet`
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Response]
     */
    restage (appGuid) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            // In v3, restaging is handled through droplet and package management
            // This is a complex operation, might need separate implementation
            throw new Error("Restage is not directly supported in v3 API. Use package/droplet endpoints instead.");
        }

        const url = `${this.API_URL}/v2/apps/${appGuid}/restage`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Get droplets for an app (v3 only)
     * {@link https://v3-apidocs.cloudfoundry.org/index.html#list-droplets}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Droplets]
     */
    getDroplets(appGuid) {
        if (!this.isUsingV3()) {
            throw new Error("getDroplets is only available in v3 API");
        }

        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const url = `${this.API_URL}/v3/apps/${appGuid}/droplets`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get packages for an app (v3 only)
     * {@link https://v3-apidocs.cloudfoundry.org/index.html#list-packages}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Packages]
     */
    getPackages(appGuid) {
        if (!this.isUsingV3()) {
            throw new Error("getPackages is only available in v3 API");
        }

        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const url = `${this.API_URL}/v3/apps/${appGuid}/packages`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get processes for an app (v3 only)
     * {@link https://v3-apidocs.cloudfoundry.org/index.html#list-processes}
     *
     * @param  {String} appGuid [App guid]
     * @return {JSON}           [Processes]
     */
    getProcesses(appGuid) {
        if (!this.isUsingV3()) {
            throw new Error("getProcesses is only available in v3 API");
        }

        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const url = `${this.API_URL}/v3/apps/${appGuid}/processes`;

        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: token
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }
}

module.exports = Apps;
