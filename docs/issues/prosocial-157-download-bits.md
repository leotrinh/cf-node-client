# Issue #157 — Download Bits from an App

- **Source:** [prosociallearnEU/cf-nodejs-client#157](https://github.com/prosociallearnEU/cf-nodejs-client/issues/157)
- **Status:** NOT RESOLVED
- **Priority:** Low
- **Created:** 2015-12-24

## Description
Request to implement `GET /v2/apps/:guid/download` to download app bits.

## Analysis
- `Apps.js` has `upload()` but no `download()` or `downloadBits()` method.
- No binary download capability exists in the library.

## Resolution Plan
- Add `downloadBits(appGuid)` for v2: `GET /v2/apps/:guid/download`.
- For v3, use packages API: `GET /v3/packages/:guid/download`.
