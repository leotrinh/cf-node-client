# Phase 2 — High: Runtime Bug Fixes

> **Priority:** 🟠 High  
> **Status:** ✅ Complete  
> **Issues:** ibm#45, prosocial#192, ibm#47  
> **Depends on:** Phase 1 (HttpUtils rewrite)  
> **Completed:** Events.js rewritten as ES6 class. ServiceInstances.js: async support + space filtering + start/stop.

---

## Context Links

- [Issue Doc: ibm#45 — Events/Logs TypeError](../../docs/issues/ibm-045-events-logs-type-error.md)
- [Issue Doc: prosocial#192 — Async service creation](../../docs/issues/prosocial-192-async-service-creation.md)
- [Issue Doc: ibm#47 — Service instances space filtering](../../docs/issues/ibm-047-missing-service-instances.md)

---

## Overview

Fix runtime errors that crash specific modules and add missing query parameters that cause incorrect API behavior.

---

## Issue 1: Events.js TypeError (ibm#45)

### Root Cause

`Events.js` uses the OLD constructor pattern (`CloudControllerAbs.call(this, ...)`) but references properties with OLD names that don't match the base class:

```javascript
// Events.js uses:
this.accessToken.token_type    // ❌ should be this.UAA_TOKEN.token_type
this.httpUtil.request(...)     // ❌ should be this.REST.request(...)
this.httpUtil.requestV3(...)   // ❌ should be this.REST.requestV3(...)
```

The `CloudControllerAbsConstructor` in `CloudControllerBase.js` initializes:
- `this.REST` (not `this.httpUtil`)
- `this.UAA_TOKEN` (set via `setToken()`, not `this.accessToken` from constructor)

### Fix

**Option A (Recommended):** Migrate Events.js to ES6 class extending `CloudControllerBase`

```javascript
"use strict";
const CloudControllerBase = require("./CloudControllerBase");

class Events extends CloudControllerBase {
    constructor(endPoint, options) {
        super(endPoint, options);
    }

    getEvents(filter) {
        if (this.isUsingV3()) {
            return this._getEventsV3(filter);
        }
        return this._getEventsV2(filter);
    }

    _getEventsV2(filter) {
        const url = `${this.API_URL}/v2/events`;
        const options = {
            method: "GET",
            url: url,
            qs: filter,
            json: true,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getEventsV3(filter) {
        const url = `${this.API_URL}/v3/audit_events`;
        const options = {
            method: "GET",
            url: url,
            qs: filter,
            json: true,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    getEvent(guid) {
        if (this.isUsingV3()) {
            return this._getEventV3(guid);
        }
        return this._getEventV2(guid);
    }

    _getEventV2(guid) {
        const url = `${this.API_URL}/v2/events/${guid}`;
        const options = {
            method: "GET",
            url: url,
            json: true,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    _getEventV3(guid) {
        const url = `${this.API_URL}/v3/audit_events/${guid}`;
        const options = {
            method: "GET",
            url: url,
            json: true,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }
}

module.exports = Events;
```

### Files to Modify
- `lib/model/cloudcontroller/Events.js` — Full rewrite to ES6 class

---

## Issue 2: Async Service Creation — `accepts_incomplete` (prosocial#192)

### Root Cause

CF API supports `?accepts_incomplete=true` for async service operations (create/update/delete). Current `ServiceInstances.add()` / `update()` / `remove()` methods don't pass this parameter.

### Fix

Add `accepts_incomplete` support to create, update, and delete methods:

```javascript
// In ServiceInstances.js

_addV2(instanceOptions, acceptsIncomplete = false) {
    let url = `${this.API_URL}/v2/service_instances`;
    if (acceptsIncomplete) {
        url += "?accepts_incomplete=true";
    }
    // ... rest unchanged
}

_addV3(instanceOptions, acceptsIncomplete = false) {
    let url = `${this.API_URL}/v3/service_instances`;
    // v3 handles async via Cf-Async header or query param
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
            "Content-Type": "application/json"
        },
        json: instanceOptions
    };
    if (acceptsIncomplete) {
        // v3 uses different pattern - the API returns 202 for async operations
        // Accept: application/json already handles this
    }
    return this.REST.request(options, this.HttpStatus.CREATED, true);
}
```

Update `add()`, `update()`, `remove()` signatures:

```javascript
add(instanceOptions, acceptsIncomplete = false) {
    if (this.isUsingV3()) {
        return this._addV3(instanceOptions, acceptsIncomplete);
    }
    return this._addV2(instanceOptions, acceptsIncomplete);
}
```

Also add a polling method for checking operation status:

```javascript
/**
 * Get the status of an async service operation
 * v2: GET /v2/service_instances/:guid
 * v3: GET /v3/service_instances/:guid
 * Check `last_operation.state` for: "in progress", "succeeded", "failed"
 */
getOperationStatus(guid) {
    return this.getInstance(guid);
}
```

### Files to Modify
- `lib/model/cloudcontroller/ServiceInstances.js` — Add `accepts_incomplete` param to add/update/remove

---

## Issue 3: Same-Name Services in Different Spaces (ibm#47)

### Root Cause

`getInstances()` doesn't support filtering by `space_guid`. When multiple spaces have services with the same name, results are ambiguous.

### Fix

The filter parameter already supports query strings, but docs and examples don't show space filtering:

**v2 API:** `GET /v2/service_instances?q=space_guid:GUID`
**v3 API:** `GET /v3/service_instances?space_guids=GUID`

Add convenience method:

```javascript
/**
 * Get Service Instances filtered by Space
 * Resolves ibm#47: same-name services in different spaces
 *
 * @param {String} spaceGuid - Space GUID to filter by
 * @param {Object} additionalFilter - Additional filter options
 * @return {Promise}
 */
getInstancesBySpace(spaceGuid, additionalFilter = {}) {
    if (this.isUsingV3()) {
        const filter = { ...additionalFilter, space_guids: spaceGuid };
        return this._getInstancesV3(filter);
    } else {
        const filter = { ...additionalFilter, q: `space_guid:${spaceGuid}` };
        return this._getInstancesV2(filter);
    }
}

/**
 * Get a specific Service Instance by name within a Space
 * 
 * @param {String} name - Service instance name
 * @param {String} spaceGuid - Space GUID
 * @return {Promise}
 */
getInstanceByNameInSpace(name, spaceGuid) {
    if (this.isUsingV3()) {
        return this._getInstancesV3({ names: name, space_guids: spaceGuid });
    } else {
        return this._getInstancesV2({ q: [`name:${name}`, `space_guid:${spaceGuid}`] });
    }
}
```

### Files to Modify
- `lib/model/cloudcontroller/ServiceInstances.js` — Add `getInstancesBySpace()` and `getInstanceByNameInSpace()`

---

## Todo List

- [ ] Rewrite Events.js to ES6 class with correct property names
- [ ] Add `accepts_incomplete` parameter to ServiceInstances add/update/remove
- [ ] Add `getOperationStatus()` method to ServiceInstances
- [ ] Add `getInstancesBySpace()` method to ServiceInstances
- [ ] Add `getInstanceByNameInSpace()` method to ServiceInstances
- [ ] Update `types/index.d.ts` for new method signatures
- [ ] Write unit tests for Events module
- [ ] Write unit tests for async service creation
- [ ] Write unit tests for space-filtered service queries

---

## Success Criteria

- [ ] `Events.getEvents()` and `Events.getEvent()` work without TypeError
- [ ] `ServiceInstances.add({...}, true)` sends `?accepts_incomplete=true`
- [ ] `ServiceInstances.getInstancesBySpace(spaceGuid)` returns only services from that space
- [ ] All existing tests continue to pass
- [ ] New unit tests cover each fixed scenario

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Events.js backward compat | Medium | Class export is same shape; `new Events(endpoint)` still works |
| `accepts_incomplete` changes v2 response code (202 vs 201) | Medium | Check response code handling in HttpUtils for 202 |
| Space filter query syntax differs v2 vs v3 | Low | Separate implementations already handle this |
