/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * BuildPacks::Build pack management for different applications on Cloud Foundry
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of BuildPacks. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const BuildPacks = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(BuildPacks, CloudControllerAbs);

module.exports = BuildPacks;

/**
 * Get BuildPacks list
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
BuildPacks.prototype.getBuildPacks = function (filter) {
    if (this.isUsingV3()) {
        return this._getBuildPacksV3(filter);
    } else {
        return this._getBuildPacksV2(filter);
    }
};

BuildPacks.prototype._getBuildPacksV2 = function (filter) {
    const url = `${this.API_URL}/v2/buildpacks`;
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

BuildPacks.prototype._getBuildPacksV3 = function (filter) {
    const url = `${this.API_URL}/v3/buildpacks`;
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
 * Get a BuildPack
 *
 * @param {String} guid - BuildPack unique identifier
 * @returns {Promise} Promise object
 */
BuildPacks.prototype.getBuildPack = function (guid) {
    if (this.isUsingV3()) {
        return this._getBuildPackV3(guid);
    } else {
        return this._getBuildPackV2(guid);
    }
};

BuildPacks.prototype._getBuildPackV2 = function (guid) {
    const url = `${this.API_URL}/v2/buildpacks/${guid}`;
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

BuildPacks.prototype._getBuildPackV3 = function (guid) {
    const url = `${this.API_URL}/v3/buildpacks/${guid}`;
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
 * Update a BuildPack
 *
 * @param {String} guid - BuildPack unique identifier
 * @param {Object} buildPackOptions - Options to update buildpack
 * @returns {Promise} Promise object
 */
BuildPacks.prototype.update = function (guid, buildPackOptions) {
    if (this.isUsingV3()) {
        return this._updateV3(guid, buildPackOptions);
    } else {
        return this._updateV2(guid, buildPackOptions);
    }
};

BuildPacks.prototype._updateV2 = function (guid, buildPackOptions) {
    const url = `${this.API_URL}/v2/buildpacks/${guid}`;
    const options = {
        method: 'PUT',
        url: url,
        form: buildPackOptions,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

BuildPacks.prototype._updateV3 = function (guid, buildPackOptions) {
    const url = `${this.API_URL}/v3/buildpacks/${guid}`;
    
    // Translate v2 fields to v3 format
    const v3Options = {
        name: buildPackOptions.name,
        position: buildPackOptions.position,
        enabled: buildPackOptions.enabled,
        locked: buildPackOptions.locked
    };
    
    if (buildPackOptions.filename) {
        v3Options.filename = buildPackOptions.filename;
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
 * Delete a BuildPack
 *
 * @param {String} guid - BuildPack unique identifier
 * @returns {Promise} Promise object
 */
BuildPacks.prototype.remove = function (guid) {
    if (this.isUsingV3()) {
        return this._removeV3(guid);
    } else {
        return this._removeV2(guid);
    }
};

BuildPacks.prototype._removeV2 = function (guid) {
    const url = `${this.API_URL}/v2/buildpacks/${guid}`;
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

BuildPacks.prototype._removeV3 = function (guid) {
    const url = `${this.API_URL}/v3/buildpacks/${guid}`;
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
