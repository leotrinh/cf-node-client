# Issue #158 — Download Droplet from an App

- **Source:** [prosociallearnEU/cf-nodejs-client#158](https://github.com/prosociallearnEU/cf-nodejs-client/issues/158)
- **Status:** NOT RESOLVED
- **Priority:** Low
- **Created:** 2015-12-24

## Description
Request to implement `GET /v2/apps/:guid/droplet/download` (v2) / `GET /v3/droplets/:guid/download` (v3).

## Analysis
- `Apps.js` has `getDroplets(appGuid)` which **lists** droplets but cannot download them.
- No `downloadDroplet()` method exists.

## Resolution Plan
- Add `downloadDroplet(dropletGuid)` method that streams the droplet binary.
- v3: `GET /v3/droplets/:guid/download`.
- v2: `GET /v2/apps/:guid/droplet/download`.
