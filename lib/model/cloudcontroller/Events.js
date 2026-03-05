/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

const CloudControllerBase = require('./CloudControllerBase');

/**
 * Events — audit event management for Cloud Foundry.
 * v2 uses '/v2/events', v3 uses '/v3/audit_events' (endpoint renamed).
 *
 * Migrated from legacy function-constructor pattern to ES6 class
 * extending CloudControllerBase. Fixes wrong property references
 * (this.accessToken → this.UAA_TOKEN, this.httpUtil → this.REST).
 *
 * @class
 */
class Events extends CloudControllerBase {

    /**
     * @param {String} endPoint - Cloud Controller API endpoint URL
     * @param {Object} [options={}] - Options (same as CloudControllerBase)
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Get Events list (audit_events in v3)
     * v2: {@link http://apidocs.cloudfoundry.org/214/events/list_all_events.html}
     * v3: {@link https://v3-apidocs.cloudfoundry.org/index.html#list-audit-events}
     *
     * @param {Object} [filter] - Query-string filter options
     * @return {Promise} Resolves with JSON events list
     */
    getEvents(filter) {
        if (this.isUsingV3()) {
            return this._getEventsV3(filter);
        }
        return this._getEventsV2(filter);
    }

    /** @private */
    _getEventsV2(filter) {
        const url = `${this.API_URL}/v2/events`;
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const options = {
            method: 'GET',
            url: url,
            qs: filter,
            headers: {
                'Authorization': token
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /** @private */
    _getEventsV3(filter) {
        const url = `${this.API_URL}/v3/audit_events`;
        const token = this.getAuthorizationHeader();
        const options = {
            method: 'GET',
            url: url,
            headers: { Authorization: token, 'Content-Type': 'application/json' },
            qs: filter || {},
            json: true
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get a single Event by GUID.
     *
     * @param {String} guid - Event unique identifier
     * @return {Promise} Resolves with JSON event object
     */
    getEvent(guid) {
        if (this.isUsingV3()) {
            return this._getEventV3(guid);
        }
        return this._getEventV2(guid);
    }

    /** @private */
    _getEventV2(guid) {
        const url = `${this.API_URL}/v2/events/${guid}`;
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
        const options = {
            method: 'GET',
            url: url,
            headers: {
                'Authorization': token
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /** @private */
    _getEventV3(guid) {
        const url = `${this.API_URL}/v3/audit_events/${guid}`;
        const token = this.getAuthorizationHeader();
        return this.REST.requestV3('GET', url, token);
    }
}

module.exports = Events;
