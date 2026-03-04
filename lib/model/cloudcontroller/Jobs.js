/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * Jobs::Background job management for Cloud Foundry operations.
 * NOTE: v2 uses '/v2/jobs' while v3 uses '/v3/tasks' - endpoint renamed!
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of Jobs. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints. Note: v3 uses tasks endpoint.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const Jobs = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(Jobs, CloudControllerAbs);

module.exports = Jobs;

/**
 * Get Jobs list (tasks in v3)
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
Jobs.prototype.getJobs = function (filter) {
    if (this.isUsingV3()) {
        return this._getJobsV3(filter);
    } else {
        return this._getJobsV2(filter);
    }
};

Jobs.prototype._getJobsV2 = function (filter) {
    const url = `${this.API_URL}/v2/jobs`;
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

Jobs.prototype._getJobsV3 = function (filter) {
    // NOTE: v3 renamed endpoint to tasks
    const url = `${this.API_URL}/v3/tasks`;
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
 * Get a Job
 *
 * @param {String} guid - Job unique identifier
 * @returns {Promise} Promise object
 */
Jobs.prototype.getJob = function (guid) {
    if (this.isUsingV3()) {
        return this._getJobV3(guid);
    } else {
        return this._getJobV2(guid);
    }
};

Jobs.prototype._getJobV2 = function (guid) {
    const url = `${this.API_URL}/v2/jobs/${guid}`;
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

Jobs.prototype._getJobV3 = function (guid) {
    // NOTE: v3 renamed endpoint to tasks
    const url = `${this.API_URL}/v3/tasks/${guid}`;
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
 * Create a Task (Job)
 *
 * @param {String} appGuid - Application unique identifier
 * @param {Object} taskOptions - Options to create task
 * @returns {Promise} Promise object
 */
Jobs.prototype.add = function (appGuid, taskOptions) {
    if (this.isUsingV3()) {
        return this._addV3(appGuid, taskOptions);
    } else {
        return this._addV2(appGuid, taskOptions);
    }
};

Jobs.prototype._addV2 = function (appGuid, taskOptions) {
    const url = `${this.API_URL}/v2/apps/${appGuid}/tasks`;
    const options = {
        method: 'POST',
        url: url,
        form: taskOptions,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.request(options);
};

Jobs.prototype._addV3 = function (appGuid, taskOptions) {
    // v3 uses different endpoint for creating tasks
    const url = `${this.API_URL}/v3/apps/${appGuid}/tasks`;
    
    const v3Options = {
        command: taskOptions.command,
        name: taskOptions.name,
        memory_in_mb: taskOptions.memory_in_mb || 512,
        disk_in_mb: taskOptions.disk_in_mb || 512,
        log_rate_limit_in_bytes_per_second: taskOptions.log_rate_limit_in_bytes_per_second
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
 * Cancel a Job (Task)
 *
 * @param {String} guid - Task unique identifier
 * @returns {Promise} Promise object
 */
Jobs.prototype.cancel = function (guid) {
    if (this.isUsingV3()) {
        return this._cancelV3(guid);
    } else {
        return this._cancelV2(guid);
    }
};

Jobs.prototype._cancelV2 = function (guid) {
    const url = `${this.API_URL}/v2/jobs/${guid}`;
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

Jobs.prototype._cancelV3 = function (guid) {
    // v3 uses PUT with action to cancel
    const url = `${this.API_URL}/v3/tasks/${guid}/actions/cancel`;
    const options = {
        method: 'POST',
        url: url,
        json: true,
        headers: {
            'Authorization': this.accessToken.token_type + ' ' + this.accessToken.access_token
        }
    };

    return this.httpUtil.requestV3(options);
};
