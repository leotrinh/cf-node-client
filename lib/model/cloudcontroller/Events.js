/*eslint new-cap: [2, {"capIsNew": false}]*/

'use strict';

/**
 * Events::Event management for Cloud Foundry audit logs.
 * NOTE: v2 uses '/v2/events' while v3 uses '/v3/audit_events' - endpoint renamed!
 */
const CloudControllerBase = require('./CloudControllerBase');

const CloudControllerAbs = CloudControllerBase.CloudControllerAbs;

/**
 * Creates a new instance of Events. Implementation supports both CF API v2 and v3
 * with automatic routing between endpoints. Note: v3 uses audit_events endpoint.
 * @constructor
 * @param {String} endpointUrl - API endpoint URL
 * @param {Object} accessToken - Access token object
 */
const Events = function (endpointUrl, accessToken) {
    CloudControllerAbs.call(this, endpointUrl, accessToken);
};

require('util').inherits(Events, CloudControllerAbs);

module.exports = Events;

/**
 * Get Events list (audit_events in v3)
 *
 * @param {Object} filter - filter options
 * @returns {Promise} Promise object
 */
Events.prototype.getEvents = function (filter) {
    if (this.isUsingV3()) {
        return this._getEventsV3(filter);
    } else {
        return this._getEventsV2(filter);
    }
};

Events.prototype._getEventsV2 = function (filter) {
    const url = `${this.API_URL}/v2/events`;
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

Events.prototype._getEventsV3 = function (filter) {
    // NOTE: v3 renamed endpoint to audit_events
    const url = `${this.API_URL}/v3/audit_events`;
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
 * Get an Event
 *
 * @param {String} guid - Event unique identifier
 * @returns {Promise} Promise object
 */
Events.prototype.getEvent = function (guid) {
    if (this.isUsingV3()) {
        return this._getEventV3(guid);
    } else {
        return this._getEventV2(guid);
    }
};

Events.prototype._getEventV2 = function (guid) {
    const url = `${this.API_URL}/v2/events/${guid}`;
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

Events.prototype._getEventV3 = function (guid) {
    // NOTE: v3 renamed endpoint to audit_events
    const url = `${this.API_URL}/v3/audit_events/${guid}`;
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
