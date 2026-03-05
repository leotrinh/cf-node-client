# Issue #196 — Copy Bits from Source App to Target App

- **Source:** [prosociallearnEU/cf-nodejs-client#196](https://github.com/prosociallearnEU/cf-nodejs-client/issues/196)
- **Status:** NOT RESOLVED
- **Priority:** Low
- **Created:** 2019-02-01

## Description
Request to implement `POST /v2/apps/:guid/copy_bits` endpoint to copy app bits between apps.

## Analysis
- `Apps.js` has no `copyBits()` or equivalent method.
- CF v2 API: `POST /v2/apps/:target_guid/copy_bits` with body `{ source_app_guid: "..." }`.
- CF v3 does not have a direct equivalent (uses packages/droplets workflow).

## Resolution Plan
- Add `copyBits(sourceAppGuid, targetAppGuid)` for v2.
- For v3, document the packages/droplets alternative workflow.
