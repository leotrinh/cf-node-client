# Issue #191 — Add Options to Set Environment Variables

- **Source:** [prosociallearnEU/cf-nodejs-client#191](https://github.com/prosociallearnEU/cf-nodejs-client/issues/191)
- **Status:** ✅ RESOLVED IN FORK
- **Priority:** N/A
- **Created:** 2017-05-08

## Description
Request to add `cf set-env` equivalent functionality.

## Resolution
Implemented in `Apps.js`:
- `setEnvironmentVariables(appGuid, variables)` — v3: `PATCH /v3/apps/:guid/environment_variables`, v2: `update(appGuid, { environment_json: variables })`.
- `getEnvironmentVariables(appGuid)` — retrieves current env vars.
- TypeScript types included in `types/index.d.ts`.

## Verification
```javascript
const apps = new Apps("https://api.<cf-domain>");
apps.setToken(token);
await apps.setEnvironmentVariables(appGuid, { MY_VAR: "value" });
```
