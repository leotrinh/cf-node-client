/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * Users::User management for Cloud Foundry organizations and spaces.
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of Users. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const Users = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(Users, CloudControllerAbs);

module.exports = Users;

/**
 * Get Users list
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
Users.prototype.getUsers = function (filter) {
    if (this.isUsingV3()) {
        return this._getUsersV3(filter);
    } else {
        return this._getUsersV2(filter);
    }
};

Users.prototype._getUsersV2 = function (filter) {
    const url = `${this.API_URL}/v2/users`;
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

Users.prototype._getUsersV3 = function (filter) {
    const url = `${this.API_URL}/v3/users`;
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
 * Get a User
 *
 * @param {String} guid - User unique identifier
 * @returns {Promise} Promise object
 */
Users.prototype.getUser = function (guid) {
    if (this.isUsingV3()) {
        return this._getUserV3(guid);
    } else {
        return this._getUserV2(guid);
    }
};

Users.prototype._getUserV2 = function (guid) {
    const url = `${this.API_URL}/v2/users/${guid}`;
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

Users.prototype._getUserV3 = function (guid) {
    const url = `${this.API_URL}/v3/users/${guid}`;
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
 * Create a User
 *
 * @param {Object} userOptions - Options to create user
 * @returns {Promise} Promise object
 */
Users.prototype.add = function (userOptions) {
    if (this.isUsingV3()) {
        return this._addV3(userOptions);
    } else {
        return this._addV2(userOptions);
    }
};

Users.prototype._addV2 = function (userOptions) {
    const url = `${this.API_URL}/v2/users`;
    const options = {
        method: 'POST',
        url: url,
        form: userOptions,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

Users.prototype._addV3 = function (userOptions) {
    const url = `${this.API_URL}/v3/users`;
    
    const v3Options = {
        username: userOptions.username || userOptions.guid,
        origin: userOptions.origin || 'uaa'
    };

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
 * Delete a User
 *
 * @param {String} guid - User unique identifier
 * @returns {Promise} Promise object
 */
Users.prototype.remove = function (guid) {
    if (this.isUsingV3()) {
        return this._removeV3(guid);
    } else {
        return this._removeV2(guid);
    }
};

Users.prototype._removeV2 = function (guid) {
    const url = `${this.API_URL}/v2/users/${guid}`;
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

Users.prototype._removeV3 = function (guid) {
    const url = `${this.API_URL}/v3/users/${guid}`;
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
