# Issue #45 — Events and Logs TypeError

- **Source:** [IBM-Cloud/cf-nodejs-client#45](https://github.com/IBM-Cloud/cf-nodejs-client/issues/45)
- **Status:** PARTIALLY RESOLVED
- **Priority:** High
- **Created:** 2017-09-14

## Description
`getEvents(guid)` and `getRecentLogs(guid)` throw `TypeError: Cannot read property 'replace' of undefined`.

## Analysis
- `Events.js` exists with `getEvents()` and `getEvent()` supporting v2/v3.
- However, it uses old constructor pattern and references `this.accessToken` and `this.httpUtil` which are NOT defined on `CloudControllerBase` (base class uses `this.UAA_TOKEN` and `this.REST`).
- This mismatch causes the exact `TypeError` described in the issue.
- `Logs.js` is standalone and works independently, but returns raw unparsed data.

## Resolution Plan
- Fix `Events.js` to use `this.UAA_TOKEN` and `this.REST` (or align with modern class-based pattern).
- Verify `Logs.js` endpoint compatibility.
- Add integration tests for both Events and Logs.
