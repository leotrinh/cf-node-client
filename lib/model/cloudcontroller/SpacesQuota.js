/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * SpacesQuota::Space Quota management for Cloud Foundry.
 * NOTE: v2 uses '/v2/space_quota_definitions' while v3 uses '/v3/space_quotas' - endpoint renamed!
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of SpacesQuota. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints. Note: v3 renamed to space_quotas.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const SpacesQuota = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(SpacesQuota, CloudControllerAbs);

module.exports = SpacesQuota;

/**
 * Get SpaceQuotas list
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
SpacesQuota.prototype.getSpaceQuotas = function (filter) {
    if (this.isUsingV3()) {
        return this._getSpaceQuotasV3(filter);
    } else {
        return this._getSpaceQuotasV2(filter);
    }
};

SpacesQuota.prototype._getSpaceQuotasV2 = function (filter) {
    // v2 endpoint name
    const url = `${this.API_URL}/v2/space_quota_definitions`;
    const options = {
        method: 'GET',
        url: url,
        qs: filter,
        json: true,
        headers: {
            'Authorization': this.getAuthorizationHeader()
        }
    };
    return this.httpUtil.request(options);
};

SpacesQuota.prototype._getSpaceQuotasV3 = function (filter) {
    // v3 renamed endpoint
    const url = `${this.API_URL}/v3/space_quotas`;
    const options = {
        method: 'GET',
        url: url,
        qs: filter,
        json: true,
        headers: {
            'Authorization': this.getAuthorizationHeader()
        }
    };
    return this.httpUtil.requestV3(options);
};

/**
 * Get a SpaceQuota
 *
 * @param {String} guid - SpaceQuota unique identifier
 * @returns {Promise} Promise object
 */
SpacesQuota.prototype.getSpaceQuota = function (guid) {
    if (this.isUsingV3()) {
        return this._getSpaceQuotaV3(guid);
    } else {
        return this._getSpaceQuotaV2(guid);
    }
};

SpacesQuota.prototype._getSpaceQuotaV2 = function (guid) {
    const url = `${this.API_URL}/v2/space_quota_definitions/${guid}`;
    const options = {
        method: 'GET',
        url: url,
        json: true,
        headers: {
            'Authorization': this.getAuthorizationHeader()
        }
    };
    return this.httpUtil.request(options);
};

SpacesQuota.prototype._getSpaceQuotaV3 = function (guid) {
    const url = `${this.API_URL}/v3/space_quotas/${guid}`;
    const options = {
        method: 'GET',
        url: url,
        json: true,
        headers: {
            'Authorization': this.getAuthorizationHeader()
        }
    };
    return this.httpUtil.requestV3(options);
};

/**
 * Create a SpaceQuota
 *
 * @param {Object} quotaOptions - Options to create quota
 * @returns {Promise} Promise object
 */
SpacesQuota.prototype.add = function (quotaOptions) {
    if (this.isUsingV3()) {
        return this._addV3(quotaOptions);
    } else {
        return this._addV2(quotaOptions);
    }
};

SpacesQuota.prototype._addV2 = function (quotaOptions) {
    const url = `${this.API_URL}/v2/space_quota_definitions`;
    const options = {
        method: 'POST',
        url: url,
        form: quotaOptions,
        json: true,
        headers: {
            'Authorization': this.getAuthorizationHeader()
        }
    };
    return this.httpUtil.request(options);
};

SpacesQuota.prototype._addV3 = function (quotaOptions) {
    const url = `${this.API_URL}/v3/space_quotas`;
    
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
 * Update a SpaceQuota
 *
 * @param {String} guid - SpaceQuota unique identifier
 * @param {Object} quotaOptions - Options to update quota
 * @returns {Promise} Promise object
 */
SpacesQuota.prototype.update = function (guid, quotaOptions) {
    if (this.isUsingV3()) {
        return this._updateV3(guid, quotaOptions);
    } else {
        return this._updateV2(guid, quotaOptions);
    }
};

SpacesQuota.prototype._updateV2 = function (guid, quotaOptions) {
    const url = `${this.API_URL}/v2/space_quota_definitions/${guid}`;
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

SpacesQuota.prototype._updateV3 = function (guid, quotaOptions) {
    const url = `${this.API_URL}/v3/space_quotas/${guid}`;
    
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
 * Delete a SpaceQuota
 *
 * @param {String} guid - SpaceQuota unique identifier
 * @returns {Promise} Promise object
 */
SpacesQuota.prototype.remove = function (guid) {
    if (this.isUsingV3()) {
        return this._removeV3(guid);
    } else {
        return this._removeV2(guid);
    }
};

SpacesQuota.prototype._removeV2 = function (guid) {
    const url = `${this.API_URL}/v2/space_quota_definitions/${guid}`;
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

SpacesQuota.prototype._removeV3 = function (guid) {
    const url = `${this.API_URL}/v3/space_quotas/${guid}`;
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
