# Issue #199 — Control Start/Stop of HANA Cloud DB

- **Source:** [prosociallearnEU/cf-nodejs-client#199](https://github.com/prosociallearnEU/cf-nodejs-client/issues/199)
- **Status:** NOT RESOLVED
- **Priority:** Medium
- **Created:** 2023-07-31

## Description
User wants to use `cf-nodejs-client` to control the start and stop of HANA Cloud DB via `ServiceInstances`. The error `CF-ServiceBrokerRequestRejected (10001)` occurs when calling `target.stop(id)`.

## Analysis
- `ServiceInstances.js` has `add()`, `update()`, `remove()`, `getInstances()`, `getServiceBindings()`.
- No dedicated `start()`/`stop()` method exists.
- HANA Cloud lifecycle management requires sending `PATCH` with `parameters: { data: { serviceStopped: true/false } }`.

## Resolution Plan
- Add convenience methods `startInstance(guid)` / `stopInstance(guid)` that wrap `update()` with the correct parameters payload.
- Document HANA Cloud DB lifecycle management in Usage guide.

## Related
- Also relates to #192 (accepts_incomplete for async service operations).
