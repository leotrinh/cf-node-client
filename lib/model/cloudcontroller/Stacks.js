/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * Stacks::Stack management for building applications on Cloud Foundry.
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of Stacks. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const Stacks = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(Stacks, CloudControllerAbs);

module.exports = Stacks;

/**
 * Get Stacks list
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
Stacks.prototype.getStacks = function (filter) {
    if (this.isUsingV3()) {
        return this._getStacksV3(filter);
    } else {
        return this._getStacksV2(filter);
    }
};

Stacks.prototype._getStacksV2 = function (filter) {
    const url = `${this.API_URL}/v2/stacks`;
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

Stacks.prototype._getStacksV3 = function (filter) {
    const url = `${this.API_URL}/v3/stacks`;
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
 * Get a Stack
 *
 * @param {String} guid - Stack unique identifier
 * @returns {Promise} Promise object
 */
Stacks.prototype.getStack = function (guid) {
    if (this.isUsingV3()) {
        return this._getStackV3(guid);
    } else {
        return this._getStackV2(guid);
    }
};

Stacks.prototype._getStackV2 = function (guid) {
    const url = `${this.API_URL}/v2/stacks/${guid}`;
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

Stacks.prototype._getStackV3 = function (guid) {
    const url = `${this.API_URL}/v3/stacks/${guid}`;
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
