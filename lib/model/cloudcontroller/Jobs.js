"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Jobs — background job / task management for Cloud Foundry.
 * NOTE: v2 uses '/v2/jobs' while v3 uses '/v3/tasks' (endpoint renamed).
 * Supports both CF API v2 and v3 with automatic version routing.
 *
 * @class
 */
class Jobs extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get Jobs list (tasks in v3)
     * @param {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON jobs/tasks list
     */
    getJobs(filter) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            const options = {
                method: "GET",
                url: `${this.API_URL}/v3/tasks`,
                headers: { Authorization: token, "Content-Type": "application/json" },
                qs: filter || {},
                json: true
            };
            return this.REST.request(options, this.HttpStatus.OK, true);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/jobs`,
            qs: filter,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single Job/Task by GUID
     * @param {String} guid - Job unique identifier
     * @return {Promise} Resolves with JSON job object
     */
    getJob(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("GET", `${this.API_URL}/v3/tasks/${guid}`, token);
        }
        const options = {
            method: "GET",
            url: `${this.API_URL}/v2/jobs/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Create a Task (Job)
     * NOTE: Tasks are a v3-only concept. v2 does not support task creation.
     * @param {String} appGuid - Application unique identifier
     * @param {Object} taskOptions - Task creation options
     * @return {Promise} Resolves with JSON task object
     * @throws {Error} If using v2 API (tasks not supported)
     */
    add(appGuid, taskOptions) {
        if (!this.isUsingV3()) {
            throw new Error("Task creation is only supported in CF API v3. Use v3 mode.");
        }
        const token = this.getAuthorizationHeader();
        const v3Body = {
            command: taskOptions.command,
            name: taskOptions.name,
            memory_in_mb: taskOptions.memory_in_mb || 512,
            disk_in_mb: taskOptions.disk_in_mb || 512,
            log_rate_limit_in_bytes_per_second: taskOptions.log_rate_limit_in_bytes_per_second
        };
        return this.REST.requestV3("POST", `${this.API_URL}/v3/apps/${appGuid}/tasks`, token, v3Body, this.HttpStatus.CREATED);
    }

    /**
     * Cancel a Job (Task)
     * @param {String} guid - Task unique identifier
     * @return {Promise} Resolves when task is cancelled
     */
    cancel(guid) {
        const token = this.getAuthorizationHeader();
        if (this.isUsingV3()) {
            return this.REST.requestV3("POST", `${this.API_URL}/v3/tasks/${guid}/actions/cancel`, token, null, this.HttpStatus.ACCEPTED);
        }
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/v2/jobs/${guid}`,
            headers: { Authorization: token }
        };
        return this.REST.request(options, this.HttpStatus.NO_CONTENT, false);
    }
}

module.exports = Jobs;
