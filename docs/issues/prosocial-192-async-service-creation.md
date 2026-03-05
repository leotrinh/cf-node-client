# Issue #192 — Unable to Create Service with CF-AsyncRequired

- **Source:** [prosociallearnEU/cf-nodejs-client#192](https://github.com/prosociallearnEU/cf-nodejs-client/issues/192)
- **Status:** NOT RESOLVED
- **Priority:** High
- **Created:** 2018-04-24

## Description
`ServiceInstances.create()` fails with `CF-AsyncRequired (10001)` when creating services that require asynchronous provisioning (e.g., databases). Missing `accepts_incomplete=true` query parameter.

## Analysis
- `ServiceInstances._addV2()` does `POST /v2/service_instances` without `?accepts_incomplete=true`.
- `ServiceInstances._addV3()` similarly has no async support parameter.
- CF API docs: `accepts_incomplete` is a URL query parameter, not a body parameter.

## Resolution Plan
- Add `accepts_incomplete` as optional parameter to `add()` and `update()`.
- Pass as query string: `?accepts_incomplete=true` for v2.
- For v3, check if async is handled differently (v3 handles async by default).
