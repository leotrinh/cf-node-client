"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * Jobs — background job and task management for Cloud Foundry.
 *
 * **Terminology:**
 * - **v2 Jobs** (`/v2/jobs`): background operations tracked by the CC.
 * - **v3 Tasks** (`/v3/tasks`): one-off processes run within an app context.
 * - **v3 Jobs** (`/v3/jobs`): async operation polling for long-running CC operations
 *   (e.g. org/space delete, service instance provisioning). These are returned in
 *   `Location` headers with 202 Accepted responses.
 *
 * The getJobs/getJob/add/cancel methods manage **v2 Jobs** and **v3 Tasks**.
 * The getV3Job/pollJob methods manage **v3 async operation Jobs**.
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

    // ================================================================
    // v2 Jobs / v3 Tasks
    // ================================================================

    /**
     * Get Jobs list (v2) or Tasks list (v3).
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
     * Get a single Job (v2) or Task (v3) by GUID.
     * NOTE: For v3 async operation Jobs (from 202 Location headers), use getV3Job().
     * @param {String} guid - Job/Task unique identifier
     * @return {Promise} Resolves with JSON job/task object
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
     * Create a Task (v3 only).
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
     * Cancel a Task (v3) or delete a Job (v2).
     * @param {String} guid - Task/Job unique identifier
     * @return {Promise} Resolves when task is cancelled / job is deleted
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

    // ================================================================
    // v3 Async Operation Jobs  (/v3/jobs/:guid)
    // ================================================================

    /**
     * Get a v3 async operation Job by GUID.
     * v3 Jobs track background CC operations (org delete, service provisioning, etc.).
     * They are separate from v3 Tasks (which run inside app containers).
     *
     * @param {String} jobGuid - Job GUID (from Location header of 202 responses)
     * @return {Promise} Resolves with job object { guid, state, operation, errors, ... }
     *   state: "PROCESSING" | "POLLING" | "COMPLETE" | "FAILED"
     */
    getV3Job(jobGuid) {
        const token = this.getAuthorizationHeader();
        return this.REST.requestV3("GET", `${this.API_URL}/v3/jobs/${jobGuid}`, token);
    }

    /**
     * Poll a v3 async operation Job until it completes or fails.
     * Repeatedly queries GET /v3/jobs/:guid until state is COMPLETE or FAILED.
     *
     * @param {String} jobGuid - Job GUID
     * @param {Object} [options] - Polling options
     * @param {Number} [options.interval=2000] - Poll interval in ms (default 2s)
     * @param {Number} [options.timeout=300000] - Max wait time in ms (default 5min)
     * @return {Promise} Resolves with completed job object, rejects on FAILED or timeout
     */
    pollJob(jobGuid, options = {}) {
        const self = this;
        const interval = options.interval || 2000;
        const timeout = options.timeout || 300000;
        const startTime = Date.now();

        return new Promise(function (resolve, reject) {
            function poll() {
                if (Date.now() - startTime > timeout) {
                    return reject(new Error(`Job ${jobGuid} polling timed out after ${timeout}ms`));
                }
                self.getV3Job(jobGuid).then(function (job) {
                    if (job.state === "COMPLETE") {
                        return resolve(job);
                    }
                    if (job.state === "FAILED") {
                        const errMsg = (job.errors && job.errors.length > 0)
                            ? job.errors.map(function (e) { return e.detail || e.title; }).join("; ")
                            : "Job failed";
                        const err = new Error(errMsg);
                        err.job = job;
                        return reject(err);
                    }
                    // Still PROCESSING or POLLING — wait and retry
                    setTimeout(poll, interval);
                }).catch(reject);
            }
            poll();
        });
    }
}

module.exports = Jobs;
