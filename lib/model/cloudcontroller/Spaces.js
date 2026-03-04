"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage Spaces on Cloud Foundry
 * Supports both Cloud Foundry API v2 and v3
 */
class Spaces extends CloudControllerBase {

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
     * Get Spaces (supports both v2 and v3)
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/list_all_spaces.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-spaces}
     *
     * @param {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to spaces list]
     */
    getSpaces(filter) {
        if (this.isUsingV3()) {
            return this._getSpacesV3(filter);
        } else {
            return this._getSpacesV2(filter);
        }
    }

    _getSpacesV2(filter) {
        const url = `${this.API_URL}/v2/spaces`;
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

    _getSpacesV3(filter) {
        const url = `${this.API_URL}/v3/spaces`;
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
     * Get a specific Space by GUID
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/retrieve_a_particular_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-a-space}
     *
     * @param  {String} guid [Space GUID]
     * @return {Promise} [Promise resolving to space]
     */
    getSpace(guid) {
        if (this.isUsingV3()) {
            return this._getSpaceV3(guid);
        } else {
            return this._getSpaceV2(guid);
        }
    }

    _getSpaceV2(guid) {
        const url = `${this.API_URL}/v2/spaces/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getSpaceV3(guid) {
        const url = `${this.API_URL}/v3/spaces/${guid}`;
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
     * Get summary of a Space (v2 only)
     * {@link http://apidocs.cloudfoundry.org/214/spaces/get_space_summary.html}
     *
     * @param  {String} guid [Space GUID]
     * @return {Promise} [Promise resolving to space summary]
     */
    getSummary(guid) {
        if (this.isUsingV3()) {
            // In v3, use getSpace instead
            return this._getSpaceV3(guid);
        }
        return this._getSummaryV2(guid);
    }

    _getSummaryV2(guid) {
        const url = `${this.API_URL}/v2/spaces/${guid}/summary`;
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
     * Add a new Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/creating_a_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#create-a-space}
     *
     * @param {Object} spaceOptions [Space options]
     * @return {Promise} [Promise resolving to created space]
     */
    add(spaceOptions) {
        if (this.isUsingV3()) {
            return this._addV3(spaceOptions);
        } else {
            return this._addV2(spaceOptions);
        }
    }

    _addV2(spaceOptions) {
        const url = `${this.API_URL}/v2/spaces`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(spaceOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    _addV3(spaceOptions) {
        const url = `${this.API_URL}/v3/spaces`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: spaceOptions
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/updating_a_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-a-space}
     *
     * @param  {String} guid [Space GUID]
     * @param  {Object} spaceOptions [Space options]
     * @return {Promise} [Promise resolving to updated space]
     */
    update(guid, spaceOptions) {
        if (this.isUsingV3()) {
            return this._updateV3(guid, spaceOptions);
        } else {
            return this._updateV2(guid, spaceOptions);
        }
    }

    _updateV2(guid, spaceOptions) {
        const url = `${this.API_URL}/v2/spaces/${guid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(spaceOptions)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _updateV3(guid, spaceOptions) {
        const url = `${this.API_URL}/v3/spaces/${guid}`;
        const options = {
            method: "PATCH",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: spaceOptions
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/delete_a_particular_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-a-space}
     *
     * @param  {String} guid [Space GUID]
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
        const url = `${this.API_URL}/v2/spaces/${guid}`;
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
        const url = `${this.API_URL}/v3/spaces/${guid}`;
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
     * Get apps in a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/list_all_apps_for_the_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-apps}
     *
     * @param  {String} guid [Space GUID]
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
        const url = `${this.API_URL}/v2/spaces/${guid}/apps`;
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
        let qs = filter || {};
        qs["space_guids"] = guid;

        const url = `${this.API_URL}/v3/apps`;
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
     * Get users in a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/list_all_users_for_the_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-space-members}
     *
     * @param  {String} guid [Space GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to users list]
     */
    getUsers(guid, filter) {
        if (this.isUsingV3()) {
            return this._getUsersV3(guid, filter);
        } else {
            return this._getUsersV2(guid, filter);
        }
    }

    _getUsersV2(guid, filter) {
        const url = `${this.API_URL}/v2/spaces/${guid}/users`;
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

    _getUsersV3(guid, filter) {
        const url = `${this.API_URL}/v3/spaces/${guid}/relationships/members`;
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
     * Get managers in a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/list_all_managers_for_the_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-space-managers}
     *
     * @param  {String} guid [Space GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to managers list]
     */
    getManagers(guid, filter) {
        if (this.isUsingV3()) {
            return this._getManagersV3(guid, filter);
        } else {
            return this._getManagersV2(guid, filter);
        }
    }

    _getManagersV2(guid, filter) {
        const url = `${this.API_URL}/v2/spaces/${guid}/managers`;
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

    _getManagersV3(guid, filter) {
        const url = `${this.API_URL}/v3/spaces/${guid}/relationships/managers`;
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
     * Get developers in a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/list_all_developers_for_the_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-space-developers}
     *
     * @param  {String} guid [Space GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to developers list]
     */
    getDevelopers(guid, filter) {
        if (this.isUsingV3()) {
            return this._getDevelopersV3(guid, filter);
        } else {
            return this._getDevelopersV2(guid, filter);
        }
    }

    _getDevelopersV2(guid, filter) {
        const url = `${this.API_URL}/v2/spaces/${guid}/developers`;
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

    _getDevelopersV3(guid, filter) {
        const url = `${this.API_URL}/v3/spaces/${guid}/relationships/developers`;
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
     * Get auditors in a Space
     * v2: {@link http://apidocs.cloudfoundry.org/214/spaces/list_all_auditors_for_the_space.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-space-auditors}
     *
     * @param  {String} guid [Space GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to auditors list]
     */
    getAuditors(guid, filter) {
        if (this.isUsingV3()) {
            return this._getAuditorsV3(guid, filter);
        } else {
            return this._getAuditorsV2(guid, filter);
        }
    }

    _getAuditorsV2(guid, filter) {
        const url = `${this.API_URL}/v2/spaces/${guid}/auditors`;
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

    _getAuditorsV3(guid, filter) {
        const url = `${this.API_URL}/v3/spaces/${guid}/relationships/auditors`;
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

module.exports = Spaces;
