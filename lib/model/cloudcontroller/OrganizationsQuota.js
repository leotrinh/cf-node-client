/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * OrganizationsQuota::Organization Quota management for Cloud Foundry.
 * NOTE: v2 uses '/v2/quota_definitions' while v3 uses '/v3/organization_quotas' - endpoint renamed!
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of OrganizationsQuota. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints. Note: v3 renamed to organization_quotas.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const OrganizationsQuota = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(OrganizationsQuota, CloudControllerAbs);

module.exports = OrganizationsQuota;

/**
 * Get OrganizationQuotas list
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
OrganizationsQuota.prototype.getOrganizationQuotas = function (filter) {
    if (this.isUsingV3()) {
        return this._getOrganizationQuotasV3(filter);
    } else {
        return this._getOrganizationQuotasV2(filter);
    }
};

OrganizationsQuota.prototype._getOrganizationQuotasV2 = function (filter) {
    // v2 endpoint name
    const url = `${this.API_URL}/v2/quota_definitions`;
    const options = {
        method: 'GET',
        url: url,
        qs: filter,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

OrganizationsQuota.prototype._getOrganizationQuotasV3 = function (filter) {
    // v3 renamed endpoint
    const url = `${this.API_URL}/v3/organization_quotas`;
    const options = {
        method: 'GET',
        url: url,
        qs: filter,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.requestV3(options);
};

/**
 * Get an OrganizationQuota
 *
 * @param {String} guid - OrganizationQuota unique identifier
 * @returns {Promise} Promise object
 */
OrganizationsQuota.prototype.getOrganizationQuota = function (guid) {
    if (this.isUsingV3()) {
        return this._getOrganizationQuotaV3(guid);
    } else {
        return this._getOrganizationQuotaV2(guid);
    }
};

OrganizationsQuota.prototype._getOrganizationQuotaV2 = function (guid) {
    const url = `${this.API_URL}/v2/quota_definitions/${guid}`;
    const options = {
        method: 'GET',
        url: url,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

OrganizationsQuota.prototype._getOrganizationQuotaV3 = function (guid) {
    const url = `${this.API_URL}/v3/organization_quotas/${guid}`;
    const options = {
        method: 'GET',
        url: url,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.requestV3(options);
};

/**
 * Create an OrganizationQuota
 *
 * @param {Object} quotaOptions - Options to create quota
 * @returns {Promise} Promise object
 */
OrganizationsQuota.prototype.add = function (quotaOptions) {
    if (this.isUsingV3()) {
        return this._addV3(quotaOptions);
    } else {
        return this._addV2(quotaOptions);
    }
};

OrganizationsQuota.prototype._addV2 = function (quotaOptions) {
    const url = `${this.API_URL}/v2/quota_definitions`;
    const options = {
        method: 'POST',
        url: url,
        form: quotaOptions,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

OrganizationsQuota.prototype._addV3 = function (quotaOptions) {
    const url = `${this.API_URL}/v3/organization_quotas`;
    
    // Translate v2 fields to v3 format
    const v3Options = {
        name: quotaOptions.name,
        relationships: {
            organization: {
                data: {
                    guid: quotaOptions.organization_guid
                }
            }
        }
    };
    
    if (quotaOptions.memory_limit) {
        v3Options.limits = v3Options.limits || {};
        v3Options.limits.memory_limit_in_gb = quotaOptions.memory_limit / 1024;
    }
    
    if (quotaOptions.instance_memory_limit) {
        v3Options.limits = v3Options.limits || {};
        v3Options.limits.process_memory_limit_in_mb = quotaOptions.instance_memory_limit;
    }
    
    if (quotaOptions.app_instance_limit) {
        v3Options.limits = v3Options.limits || {};
        v3Options.limits.app_instance_limit = quotaOptions.app_instance_limit;
    }

    const options = {
        method: 'POST',
        url: url,
        body: v3Options,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.requestV3(options);
};

/**
 * Update an OrganizationQuota
 *
 * @param {String} guid - OrganizationQuota unique identifier
 * @param {Object} quotaOptions - Options to update quota
 * @returns {Promise} Promise object
 */
OrganizationsQuota.prototype.update = function (guid, quotaOptions) {
    if (this.isUsingV3()) {
        return this._updateV3(guid, quotaOptions);
    } else {
        return this._updateV2(guid, quotaOptions);
    }
};

OrganizationsQuota.prototype._updateV2 = function (guid, quotaOptions) {
    const url = `${this.API_URL}/v2/quota_definitions/${guid}`;
    const options = {
        method: 'PUT',
        url: url,
        form: quotaOptions,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

OrganizationsQuota.prototype._updateV3 = function (guid, quotaOptions) {
    const url = `${this.API_URL}/v3/organization_quotas/${guid}`;
    
    // Translate v2 fields to v3 format
    const v3Options = {
        name: quotaOptions.name
    };
    
    if (quotaOptions.memory_limit) {
        v3Options.limits = v3Options.limits || {};
        v3Options.limits.memory_limit_in_gb = quotaOptions.memory_limit / 1024;
    }
    
    if (quotaOptions.instance_memory_limit) {
        v3Options.limits = v3Options.limits || {};
        v3Options.limits.process_memory_limit_in_mb = quotaOptions.instance_memory_limit;
    }
    
    if (quotaOptions.app_instance_limit) {
        v3Options.limits = v3Options.limits || {};
        v3Options.limits.app_instance_limit = quotaOptions.app_instance_limit;
    }

    const options = {
        method: 'PATCH',
        url: url,
        body: v3Options,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.requestV3(options);
};

/**
 * Delete an OrganizationQuota
 *
 * @param {String} guid - OrganizationQuota unique identifier
 * @returns {Promise} Promise object
 */
OrganizationsQuota.prototype.remove = function (guid) {
    if (this.isUsingV3()) {
        return this._removeV3(guid);
    } else {
        return this._removeV2(guid);
    }
};

OrganizationsQuota.prototype._removeV2 = function (guid) {
    const url = `${this.API_URL}/v2/quota_definitions/${guid}`;
    const options = {
        method: 'DELETE',
        url: url,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

OrganizationsQuota.prototype._removeV3 = function (guid) {
    const url = `${this.API_URL}/v3/organization_quotas/${guid}`;
    const options = {
        method: 'DELETE',
        url: url,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.requestV3(options);
};
