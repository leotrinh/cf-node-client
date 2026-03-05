# Issue #15 — Add getTokenInfo(accessToken) Method to UsersUAA

- **Source:** [IBM-Cloud/cf-nodejs-client#15](https://github.com/IBM-Cloud/cf-nodejs-client/issues/15)
- **Status:** NOT RESOLVED
- **Priority:** Medium
- **Created:** 2016-05-09

## Description
Request to add a method to decode access tokens into username, email, and user GUID. Includes reference Go implementation for JWT token decoding.

## Analysis
- `UsersUAA.js` has: `add`, `updatePassword`, `remove`, `getUsers`, `login`, `refreshToken`.
- No `getTokenInfo()` method exists.
- UAA provides `POST /check_token` and `GET /tokeninfo` endpoints.
- Alternative: decode JWT locally (base64 decode the payload segment).

## Resolution Plan
- Add `getTokenInfo(accessToken)` method that:
  - Option A: Calls `POST /check_token` on the UAA endpoint (server-validated).
  - Option B: Decodes JWT payload locally (faster, no network call, but not validated).
  - Recommend Option A with Option B as fallback.
- Return `TokenInfo { username, email, userGuid }`.
