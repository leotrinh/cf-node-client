"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Manage Organizations in Cloud Foundry
 * Supports both Cloud Foundry API v2 and v3
 */
class Organizations extends CloudControllerBase {

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
     * Get Organizations (supports both v2 and v3)
     * v2: {@link http://apidocs.cloudfoundry.org/213/organizations/list_all_organizations.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-organizations}
     *
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to organizations list]
     */
    getOrganizations(filter) {
        if (this.isUsingV3()) {
            return this._getOrganizationsV3(filter);
        } else {
            return this._getOrganizationsV2(filter);
        }
    }

    _getOrganizationsV2(filter) {
        const url = `${this.API_URL}/v2/organizations`;
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

    _getOrganizationsV3(filter) {
        const url = `${this.API_URL}/v3/organizations`;
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
     * Get a specific Organization by GUID
     * v2: {@link http://apidocs.cloudfoundry.org/278/organizations/retrieve_a_particular_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#get-an-organization}
     *
     * @param  {String} guid [Organization GUID]
     * @return {Promise} [Promise resolving to organization]
     */
    getOrganization(guid) {
        if (this.isUsingV3()) {
            return this._getOrganizationV3(guid);
        } else {
            return this._getOrganizationV2(guid);
        }
    }

    _getOrganizationV2(guid) {
        const url = `${this.API_URL}/v2/organizations/${guid}`;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getOrganizationV3(guid) {
        const url = `${this.API_URL}/v3/organizations/${guid}`;
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
     * Get memory usage from an Organization (v2 only)
     * {@link http://apidocs.cloudfoundry.org/222/organizations/retrieving_organization_memory_usage.html}
     *
     * @param  {String} guid [Organization GUID]
     * @return {Promise} [Promise resolving to memory usage]
     */
    getMemoryUsage(guid) {
        if (this.isUsingV3()) {
            throw new Error("getMemoryUsage is not available in Cloud Foundry API v3. Use v2 API for this operation.");
        }
        return this._getMemoryUsageV2(guid);
    }

    _getMemoryUsageV2(guid) {
        const url = `${this.API_URL}/v2/organizations/${guid}/memory_usage`;
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
     * Get summary from an Organization (v2 only)
     * {@link http://apidocs.cloudfoundry.org/222/organizations/get_organization_summary.html}
     *
     * @param  {String} guid [Organization GUID]
     * @return {Promise} [Promise resolving to organization summary]
     */
    getSummary(guid) {
        if (this.isUsingV3()) {
            // In v3, use getOrganization instead
            return this._getOrganizationV3(guid);
        }
        return this._getSummaryV2(guid);
    }

    _getSummaryV2(guid) {
        const url = `${this.API_URL}/v2/organizations/${guid}/summary`;
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
     * Get private domains from an Organization
     * v2: {@link http://apidocs.cloudfoundry.org/214/organizations/list_all_private_domains_for_the_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-domains}
     *
     * @param  {String} guid [Organization GUID]
     * @param  {Object} filter [Filter options]
     * @return {Promise} [Promise resolving to domains list]
     */
    getPrivateDomains(guid, filter) {
        if (this.isUsingV3()) {
            return this._getPrivateDomainsV3(guid, filter);
        } else {
            return this._getPrivateDomainsV2(guid, filter);
        }
    }

    _getPrivateDomainsV2(guid, filter) {
        const url = `${this.API_URL}/v2/organizations/${guid}/private_domains`;
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

    _getPrivateDomainsV3(guid, filter) {
        const url = `${this.API_URL}/v3/organizations/${guid}/domains`;
        let qs = filter || {};
        qs.visibility = "private";

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
     * Add a new Organization
     * v2: {@link http://apidocs.cloudfoundry.org/222/organizations/creating_an_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#create-an-organization}
     *
     * @param {Object} orgOptions [Organization options]
     * @return {Promise} [Promise resolving to created organization]
     */
    add(orgOptions) {
        if (this.isUsingV3()) {
            return this._addV3(orgOptions);
        } else {
            return this._addV2(orgOptions);
        }
    }

    _addV2(orgOptions) {
        const url = `${this.API_URL}/v2/organizations`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(orgOptions)
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    _addV3(orgOptions) {
        const url = `${this.API_URL}/v3/organizations`;
        const options = {
            method: "POST",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: orgOptions
        };

        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Update an Organization
     * v2: {@link http://apidocs.cloudfoundry.org/222/organizations/updating_an_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#update-an-organization}
     *
     * @param  {String} guid [Organization GUID]
     * @param  {Object} orgOptions [Organization options]
     * @return {Promise} [Promise resolving to updated organization]
     */
    update(guid, orgOptions) {
        if (this.isUsingV3()) {
            return this._updateV3(guid, orgOptions);
        } else {
            return this._updateV2(guid, orgOptions);
        }
    }

    _updateV2(guid, orgOptions) {
        const url = `${this.API_URL}/v2/organizations/${guid}`;
        const options = {
            method: "PUT",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            form: JSON.stringify(orgOptions)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _updateV3(guid, orgOptions) {
        const url = `${this.API_URL}/v3/organizations/${guid}`;
        const options = {
            method: "PATCH",
            url: url,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
                "Content-Type": "application/json"
            },
            json: orgOptions
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Delete an Organization
     * v2: {@link http://apidocs.cloudfoundry.org/222/organizations/delete_a_particular_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#delete-an-organization}
     *
     * @param  {String} guid [Organization GUID]
     * @param  {Object} deleteOptions [Delete options (async, purge, etc.)]
     * @return {Promise} [Promise resolving to job details]
     */
    remove(guid, deleteOptions) {
        if (this.isUsingV3()) {
            return this._removeV3(guid, deleteOptions);
        } else {
            return this._removeV2(guid, deleteOptions);
        }
    }

    _removeV2(guid, deleteOptions) {
        const url = `${this.API_URL}/v2/organizations/${guid}`;
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
        const url = `${this.API_URL}/v3/organizations/${guid}`;
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
     * Get users from an Organization
     * v2: {@link http://apidocs.cloudfoundry.org/222/organizations/list_all_users_for_the_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-users}
     *
     * @param  {String} guid [Organization GUID]
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
        const url = `${this.API_URL}/v2/organizations/${guid}/users`;
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
        const url = `${this.API_URL}/v3/organizations/${guid}/relationships/users`;
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
     * Get managers from an Organization
     * v2: {@link http://apidocs.cloudfoundry.org/222/organizations/list_all_managers_for_the_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-managers}
     *
     * @param  {String} guid [Organization GUID]
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
        const url = `${this.API_URL}/v2/organizations/${guid}/managers`;
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
        const url = `${this.API_URL}/v3/organizations/${guid}/relationships/managers`;
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
     * Get auditors from an Organization
     * v2: {@link http://apidocs.cloudfoundry.org/222/organizations/list_all_auditors_for_the_organization.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/#list-auditors}
     *
     * @param  {String} guid [Organization GUID]
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
        const url = `${this.API_URL}/v2/organizations/${guid}/auditors`;
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
        const url = `${this.API_URL}/v3/organizations/${guid}/relationships/auditors`;
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

module.exports = Organizations;
