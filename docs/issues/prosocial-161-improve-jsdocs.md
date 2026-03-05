# Issue #161 — Improve JSDocs

- **Source:** [prosociallearnEU/cf-nodejs-client#161](https://github.com/prosociallearnEU/cf-nodejs-client/issues/161)
- **Status:** PARTIALLY RESOLVED
- **Priority:** Low
- **Created:** 2016-01-08

## Description
Request to improve JSDoc documentation quality.

## Current State
- All main model classes have JSDoc with `@param`, `@return`, `@link`, `@example`.
- TypeScript declarations in `types/index.d.ts` provide API-level documentation.
- Some methods still use generic `{JSON}` or `{any}` as return types.
- `Promise<any>` used extensively instead of specific response types.

## Remaining Work
- Replace `any` types with specific interfaces (e.g., `AppResponse`, `ServiceInstanceResponse`).
- Add more inline examples for complex methods.
