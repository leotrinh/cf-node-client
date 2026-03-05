# Issue #156 — Add URL Validation

- **Source:** [prosociallearnEU/cf-nodejs-client#156](https://github.com/prosociallearnEU/cf-nodejs-client/issues/156)
- **Status:** NOT RESOLVED
- **Priority:** Medium
- **Created:** 2015-12-24

## Description
Request to validate endpoint URLs passed to constructors and `setEndPoint()`.

## Analysis
- `CloudControllerBase.constructor(endPoint)` does raw assignment without validation.
- `setEndPoint(endPoint)` same — no validation.
- Invalid URLs cause cryptic errors at HTTP request time instead of at construction time.

## Resolution Plan
- Add URL format validation in constructor and `setEndPoint()`.
- Check for valid protocol (`https://`), hostname format.
- Throw descriptive error: `"Invalid Cloud Foundry API endpoint: must be a valid URL starting with https://"`.
