/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * Domains::Domain management for different applications on Cloud Foundry.
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of Domains. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const Domains = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(Domains, CloudControllerAbs);

module.exports = Domains;

/**
 * Get Domains list
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
Domains.prototype.getDomains = function (filter) {
    if (this.isUsingV3()) {
        return this._getDomainsV3(filter);
    } else {
        return this._getDomainsV2(filter);
    }
};

Domains.prototype._getDomainsV2 = function (filter) {
    const url = `${this.API_URL}/v2/domains`;
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

Domains.prototype._getDomainsV3 = function (filter) {
    const url = `${this.API_URL}/v3/domains`;
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
 * Get a Domain
 *
 * @param {String} guid - Domain unique identifier
 * @returns {Promise} Promise object
 */
Domains.prototype.getDomain = function (guid) {
    if (this.isUsingV3()) {
        return this._getDomainV3(guid);
    } else {
        return this._getDomainV2(guid);
    }
};

Domains.prototype._getDomainV2 = function (guid) {
    const url = `${this.API_URL}/v2/domains/${guid}`;
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

Domains.prototype._getDomainV3 = function (guid) {
    const url = `${this.API_URL}/v3/domains/${guid}`;
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
 * Create a Domain
 *
 * @param {Object} domainOptions - Options to domain
 * @returns {Promise} Promise object
 */
Domains.prototype.add = function (domainOptions) {
    if (this.isUsingV3()) {
        return this._addV3(domainOptions);
    } else {
        return this._addV2(domainOptions);
    }
};

Domains.prototype._addV2 = function (domainOptions) {
    const url = `${this.API_URL}/v2/domains`;
    const options = {
        method: 'POST',
        url: url,
        form: domainOptions,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

Domains.prototype._addV3 = function (domainOptions) {
    const url = `${this.API_URL}/v3/domains`;
    
    // Translate v2 fields to v3 format if needed
    const v3Options = {
        name: domainOptions.name,
        internal: domainOptions.internal || false
    };
    
    if (domainOptions.organization_guid) {
        v3Options.organization_guid = domainOptions.organization_guid;
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
 * Delete a Domain
 *
 * @param {String} guid - Domain unique identifier
 * @returns {Promise} Promise object
 */
Domains.prototype.remove = function (guid) {
    if (this.isUsingV3()) {
        return this._removeV3(guid);
    } else {
        return this._removeV2(guid);
    }
};

Domains.prototype._removeV2 = function (guid) {
    const url = `${this.API_URL}/v2/domains/${guid}`;
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

Domains.prototype._removeV3 = function (guid) {
    const url = `${this.API_URL}/v3/domains/${guid}`;
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
