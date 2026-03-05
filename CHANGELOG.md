## Version 1.0.7 2026-03-05

**PATCH RELEASE — 7 v3 API Fixes (4 MEDIUM + 3 LOW)**

Implements all remaining audit findings for v3 API correctness and robustness. Adds support for dual status codes, v3 async job polling, and improves v3/v2 consistency.

### Bug Fixes — MEDIUM (M1–M4)

- **M1+L3 — Jobs.js:** Added `getV3Job(jobGuid)` and `pollJob(jobGuid, options)` for v3 async operation polling (`/v3/jobs/:guid`). Clarified distinction between v3 Jobs (async ops) and v3 Tasks (app processes).
- **M2 — AppsDeployment.js:** `removeServiceBindings()` v3 now accepts both 202 (managed async) and 204 (key/UPS sync).
- **M3 — ServiceBindings.js:** `_addV3()` accepts 201 or 202; `_removeV3()` accepts 202 or 204.
- **M4 — ServiceInstances.js:** `_removeV3()` accepts 202 (managed async) or 204 (UPS sync).

### Bug Fixes — LOW (L1–L3)

- **L1 — Organizations.js:** Removed ineffective `visibility=private` filter from `_getPrivateDomainsV3()`.
- **L2 — Organizations.js:** All v2/v3 methods now use `getAuthorizationHeader()` consistently.
- **L3 — Jobs.js:** Clarified endpoint mapping and JSDoc for v3 async jobs vs tasks.

### Enabler
- **HttpUtils.js:** `request()` now accepts `Number|Number[]` for status codes (enables dual-status handling above).

### Tests
- 27 new unit tests covering all fixes (`test/lib/V3AuditFixMediumLowTests.js`)
- All **139 passing**, 0 failing

---

## Version 1.0.6 2026-03-05

**PATCH RELEASE — Fix 9 v3 API Issues (5 CRITICAL + 4 HIGH)**

Full library audit identified incorrect HTTP status code expectations and wrong v3 request body structures across 8 files. All issues fixed and verified.

### Bug Fixes — CRITICAL (C1–C5): Runtime Failures

- **C1 — `AppsCore.remove()` wrong v3 status**: Expected 204 (NO_CONTENT) → Fixed to 202 (ACCEPTED). CF v3 `DELETE /v3/apps/:guid` returns 202 with a job URL for async deletion.
- **C2 — `Domains.remove()` wrong v3 status**: Expected 204 → Fixed to 202. CF v3 `DELETE /v3/domains/:guid` returns 202 Accepted.
- **C3 — `BuildPacks.remove()` wrong v3 status**: Expected 204 → Fixed to 202. CF v3 `DELETE /v3/buildpacks/:guid` returns 202 Accepted.
- **C4 — `Users.remove()` wrong v3 status**: Expected 204 → Fixed to 202. CF v3 `DELETE /v3/users/:guid` returns 202 Accepted.
- **C5 — `HttpUtils.upload()` hardcoded PUT**: v3 package upload (`POST /v3/packages/:guid/upload`) requires POST. Added `options.method` parameter, `AppsDeployment._uploadV3()` now passes `method: "POST"`. v2 path unchanged (defaults to PUT).

### Bug Fixes — HIGH (H1–H4): API Rejection

- **H1 — `Domains.add()` wrong v3 body**: Sent flat `organization_guid` field → Fixed to nested `relationships.organization.data.guid` per CF v3 spec.
- **H2 — `Users.add()` wrong v3 body**: Sent `{username, origin}` → Fixed to `{guid}` (UAA user GUID). CF v3 `POST /v3/users` requires the UAA `guid` as the primary identifier.
- **H3 — `OrganizationsQuota._translateToV3()` wrong body structure**: Used flat `limits` object with wrong field names → Fixed to proper nested `apps`, `services`, `routes`, `domains` sub-objects matching CF v3 `organization_quotas` spec.
- **H4 — `SpacesQuota._translateToV3()` wrong body structure**: Same flat `limits` issue → Fixed to nested `apps`, `services`, `routes` sub-objects. Preserves `relationships.organization` on create.

### Files Modified
- `lib/model/cloudcontroller/AppsCore.js` — C1
- `lib/model/cloudcontroller/Domains.js` — C2, H1
- `lib/model/cloudcontroller/BuildPacks.js` — C3
- `lib/model/cloudcontroller/Users.js` — C4, H2
- `lib/utils/HttpUtils.js` — C5
- `lib/model/cloudcontroller/AppsDeployment.js` — C5
- `lib/model/cloudcontroller/OrganizationsQuota.js` — H3
- `lib/model/cloudcontroller/SpacesQuota.js` — H4

### Tests
- 19 new unit tests covering all 9 fixes (`test/lib/V3AuditFixTests.js`)
- All **112 passing**, 0 failing

---

## Version 1.0.5 2026-03-05

**PATCH RELEASE — Fix 11 Incorrect v3 API Endpoints**

### Bug Fixes — AppsDeployment.js (4 fixes)

- **`getStats()` wrong v3 endpoint**: Was `/v3/apps/:guid/stats` → Fixed to `/v3/apps/:guid/processes/web/stats` (v3 stats are per-process)
- **`associateRoute()` wrong v3 method & endpoint**: Was `PUT /v3/apps/:guid/routes/:routeGuid` → Fixed to `POST /v3/routes/:routeGuid/destinations` with `{ destinations: [{ app: { guid } }] }` body
- **`getServiceBindings()` wrong v3 endpoint**: Was `/v3/apps/:guid/service_credential_bindings` → Fixed to `/v3/service_credential_bindings?app_guids=:guid` (top-level endpoint with filter)
- **`_uploadV3()` wrong single-step upload**: Was single request to `/v3/apps/:guid/bits` → Fixed to 2-step: create package via `POST /v3/packages` then upload bits to `POST /v3/packages/:guid/upload`

### Bug Fixes — Organizations.js (3 fixes)

- **`_getUsersV3()` wrong endpoint**: Was `/v3/organizations/:guid/relationships/users` → Fixed to `/v3/roles?organization_guids=:guid&types=organization_user`
- **`_getManagersV3()` wrong endpoint**: Was `/v3/organizations/:guid/relationships/managers` → Fixed to `/v3/roles?organization_guids=:guid&types=organization_manager`
- **`_getAuditorsV3()` wrong endpoint**: Was `/v3/organizations/:guid/relationships/auditors` → Fixed to `/v3/roles?organization_guids=:guid&types=organization_auditor`

### Bug Fixes — Spaces.js (4 fixes)

- **`_getUsersV3()` wrong endpoint**: Was `/v3/spaces/:guid/relationships/members` → Fixed to `/v3/roles?space_guids=:guid`
- **`_getManagersV3()` wrong endpoint**: Was `/v3/spaces/:guid/relationships/managers` → Fixed to `/v3/roles?space_guids=:guid&types=space_manager`
- **`_getDevelopersV3()` wrong endpoint**: Was `/v3/spaces/:guid/relationships/developers` → Fixed to `/v3/roles?space_guids=:guid&types=space_developer`
- **`_getAuditorsV3()` wrong endpoint**: Was `/v3/spaces/:guid/relationships/auditors` → Fixed to `/v3/roles?space_guids=:guid&types=space_auditor`

### Enhancements
- **`Spaces.getSpaceApps()`**: Added backward-compatibility alias for `Spaces.getApps()` — existing consumer code referencing the old method name continues to work

### Audit Summary
- 27 additional files scanned & confirmed clean — no issues found in Apps.js, AppsCopy.js, Routes.js, Domains.js, ServiceBindings.js, ServiceInstances.js, ServicePlans.js, Services.js, Events.js, Jobs.js, BuildPacks.js, Stacks.js, Users.js, UserProvidedServices.js, OrganizationsQuota.js, SpacesQuota.js, UsersUAA.js, Logs.js, HttpUtils.js, HttpStatus.js, ApiConfig.js, ApiVersionManager.js, ConfigManagerService.js, ErrorService.js, CacheService.js, CloudController.js, CloudControllerBase.js

### Files Modified
- `lib/model/cloudcontroller/AppsDeployment.js`
- `lib/model/cloudcontroller/Organizations.js`
- `lib/model/cloudcontroller/Spaces.js`

### Tests
- All **93 passing**, 0 failing

---

## Version 1.0.4 2026-03-05

**HOTFIX RELEASE — Critical: v3 Authentication Flow Broken**

### Bug Fixes (Critical)
- **`getInfo()` v3 mode called non-existent `/v3/info`**: CF API v3 has no `/v3/info` endpoint. Changed to root endpoint `/` which returns `{ links: { uaa, login, ... } }`. Response is normalized to include `authorization_endpoint` and `token_endpoint` at top level for backward compatibility with all existing consumer code.
- **`authorization_endpoint` was `undefined` in v3 mode**: The standard auth flow `info.authorization_endpoint → usersUAA.setEndPoint()` was completely broken for all v1.0.0+ users using default v3.

### New Features
- **`CloudController.getAuthorizationEndpoint()`**: Convenience method that returns UAA endpoint URL directly. Works with both v2 and v3, abstracts away response shape differences.

### TypeScript
- Added `getAuthorizationEndpoint(): Promise<string>` to `CloudController` type declarations

### Files Modified
- `lib/model/cloudcontroller/CloudController.js`
- `types/index.d.ts`
- `examples/cf-service-usage-example.js`

### Tests
- All **93 passing**, 0 failing

---

## Version 1.0.3 2026-03-05

**PATCH RELEASE — Code Quality Fixes & JSDoc Documentation**

### Bug Fixes (Critical)
- **C-01/C-02/C-03**: Fixed wrong HTTP status codes in `requestV3()` calls across `CloudController.js`, `ServicePlans.js`, `UserProvidedServices.js`

### Bug Fixes (Warnings)
- **W-01**: Fixed v3 filter silently ignored in 8 list endpoints (`Domains`, `Users`, `Stacks`, `BuildPacks`, `Jobs`, `OrganizationsQuota`, `SpacesQuota`, `Events`) — switched to `this.REST.request()` with `qs` support
- **W-02**: Fixed input filter object mutation in `Spaces`, `Services`, `ServiceInstances`, `Organizations` — added shallow clone via `Object.assign()`
- **W-04**: Fixed `AppsDeployment.getInstances()` wrong v3 endpoint → `/v3/apps/:guid/processes`
- **W-05**: Added mixin guard in `AppsDeployment.setEnvironmentVariables()` for v2 path
- **W-06**: Added v2 guard in `Jobs.add()` — task creation only supported in v3
- **W-07**: Fixed `ApiVersionManager` wrong v3 mapping for `userProvidedServices`, added `tasks` entry
- **W-08**: Added JSDoc for `ServiceInstances._removeV3()` explaining `acceptsIncomplete` no-op in v3
- **W-09**: Added JSDoc class-level comments for `ServicePlans`, `UserProvidedServices` explaining mixed request pattern

### Documentation
- **JSDoc Generation**: Added `grunt-jsdoc` with full HTML API docs output to `doc/` folder
- **npm scripts**: `npm run docs` (generate) and `npm run docs:serve` (generate + serve on localhost:9000)
- **README**: Added comprehensive Documentation Detail section with links to all 21 class JSDoc pages
- **GitHub Pages**: JSDoc hosted at `https://leotrinh.github.io/cf-node-client/doc/`

### DevDependencies Added
- `grunt`, `grunt-jsdoc`, `grunt-open`, `grunt-contrib-connect`

### Tests
- All **93 tests passing**, 0 failing

---

## Version 1.0.2 2026-03-05

**PATCH RELEASE — Security: Fix all 41 npm vulnerabilities**

### Security
- Removed 6 vulnerable devDependencies: `grunt`, `grunt-cli`, `grunt-connect`, `grunt-jsdoc`, `grunt-open`, `istanbul`
- Upgraded `mocha` 2.3.4 → 10.8.x, `chai` 3.4.1 → 4.5.x, `chai-as-promised` 5.1.0 → 7.1.x
- Upgraded `nconf` 0.8.2 → 0.13.x (fixed prototype pollution)
- Upgraded `archiver` 0.20.0 → 7.x
- Added npm `overrides` for `minimist` (^1.2.8) and `serialize-javascript` (^7.0.3)
- **41 vulnerabilities → 0 vulnerabilities**

### Maintenance
- Migrated mocha config from deprecated `test/mocha.opts` to `.mocharc.yml`
- All 93 tests passing, ESLint clean

## Version 1.0.1 2026-03-05

**PATCH RELEASE — Auto-Pagination & Memory Cache**

### New Features
- **Auto-Pagination**: Built-in `getAllResources(fetchFn, filter)` in `CloudControllerBase` that auto-paginates through all pages and returns a flat resource array. Works with both v2 (`next_url`) and v3 (`pagination.next`).
- **Convenience Pagination Methods**: `getAllOrganizations(filter?)`, `getAllSpaces(filter?)`, `getAllApps(filter?)`, `getAllInstances(filter?)` — thin wrappers for the most common resources
- **Memory Cache**: Opt-in `CacheService` (Map + TTL) integrated into `CloudControllerBase`. Enable via constructor `{ cache: true, cacheTTL: 60000 }` or runtime `enableCache()` / `disableCache()` / `clearCache()`
- **CacheService Module**: Standalone `lib/services/CacheService.js` — per-entry TTL, lazy expiration, prefix invalidation

### TypeScript
- Added `cache?`, `cacheTTL?` to `CloudControllerBaseOptions`
- Added `enableCache()`, `disableCache()`, `clearCache()`, `getAllResources()` to `CloudControllerBase`
- Added `getAllOrganizations()`, `getAllSpaces()`, `getAllApps()`, `getAllInstances()` to respective classes
- Exported `CacheService` class type

### Tests
- 21 new tests (8 CacheService + 8 pagination + 5 cache integration)
- Total: **93 passing**, 0 failing

### Documentation
- Updated `README.md`, `docs/Usage.md`, `docs/Usage-cf-service.md` with pagination & cache sections
- Updated `examples/cf-service-usage-example.js`, `typescript-basic.ts`, `typescript-advanced.ts`
- Updated `RELEASE_NOTES.md` with v1.0.1 section

### Files Added
- `lib/services/CacheService.js`
- `test/lib/PaginationCacheTests.js`

### Files Modified
- `lib/model/cloudcontroller/CloudControllerBase.js`
- `lib/model/cloudcontroller/Organizations.js`
- `lib/model/cloudcontroller/Spaces.js`
- `lib/model/cloudcontroller/AppsCore.js`
- `lib/model/cloudcontroller/ServiceInstances.js`
- `types/index.d.ts`
- `package.json`
- `index.js`

## Version 1.0.0 2026-03-04

**MAJOR RELEASE - Cloud Foundry API v3 Migration & Package Rename**

### TypeScript Support
- **Type Declarations**: Full `.d.ts` type definitions for all public APIs (`types/index.d.ts`)
- **IntelliSense**: Autocomplete and type checking for all 19 Cloud Controller models, UAA, and Logs
- **Typed Interfaces**: `OAuthToken`, `FilterOptions`, `DeleteOptions`, `ApiResponse<T>`, `CloudControllerBaseOptions`
- **CI Validation**: `tsc --noEmit` runs in CI pipeline to prevent type regressions
- **Examples**: TypeScript usage examples in `examples/` directory
- **Zero Runtime Impact**: Type declarations only — no runtime dependencies added

### Highlights
- **Cloud Foundry API v3 Support (Default)**: All 17 Cloud Controller models now support Cloud Foundry API v3 endpoints
- **Backward Compatibility**: Cloud Foundry API v2 support available via explicit configuration
- **Package Renamed**: `cf-nodejs-client` → `cf-node-client` (new npm package, old package no longer maintained)

### Breaking Changes
- Package name changed from `cf-nodejs-client` to `cf-node-client`
- Default API version is now v3 (v2 still available via `setApiVersion("v2")`)
- Installation: `npm install cf-node-client` (not `npm install cf-nodejs-client`)
- All imported references now use `cf-node-client` package

### New Features
- **Dual API Support**: Each Cloud Controller method supports both v2 and v3 APIs
  - v3: RESTful endpoints, improved query language, better data structures
  - v2: Legacy endpoints, form-urlencoded format (for backward compatibility)
- **Configuration System**: New `ApiConfig` and `ApiVersionManager` for version management
- **API Version Routing**: Automatic routing between v2 and v3 implementations
- **v3-Only Features**: Access to droplets, packages, and processes (v3-only)
- **Field Translation**: Automatic conversion of field names between v2 and v3 formats
- **State Management**: Auto-translation between v2 `state` and v3 `stopped` field

### Updated Models (All with v3 Support)
- Apps - 28 methods (including new v3-only methods)
- Organizations, Spaces, Services, Routes
- Service Instances, Service Bindings, Service Plans
- Domains, Build Packs, Stacks
- Users, UAA Users
- Quotas (Organization & Space)
- Events, Jobs, User-Provided Services

### New Configuration Options
```javascript
const Apps = new CloudController().Apps;
Apps.setApiVersion("v3");  // Use v3 (default)
Apps.setApiVersion("v2");  // Use v2 (legacy)
```

### Documentation
- [Migration Guide](./docs/IMPLEMENTATION_PLAN_FINAL.md) - Detailed v3 migration info
- [v3 Progress](./docs/v3-migration-progress.md) - Model-by-model status
- [API Reference](./docs/README_DOCUMENTATION_INDEX.md) - Complete API documentation

### Environment Testing Status
Environment: All (LOCAL, PWS, BLUEMIX)

### Known Limitations
- Metrics and UAA models use v2-compatible structure
- Some v2-only operations not available in v3

### Migration Path for Users
Users of `cf-nodejs-client`:
1. Update package reference: `npm uninstall cf-nodejs-client && npm install cf-node-client`
2. Update require statements: `require('cf-node-client')`
3. Optional: Set API version explicitly: `client.setApiVersion('v3')` or `client.setApiVersion('v2')`
4. For v2-only operations, use `setApiVersion('v2')` explicitly

### Contributors
- Original developer: Juan Antonio Breña Moral
- v3 Migration: Modern API Upgrade Initiative

## Version 0.13.0 2016-01-26

- Add ESLint support
- Refactor code to ES2015
- Initial support to deploy Docker containers on CF
- Refactor log support
- Add method setToken in every Object to avoid sending token in every method

Environment: LOCAL_INSTANCE_1

  90 passing (3m)
  37 pending

Environment: PIVOTAL

  87 passing (5m)
  33 pending


## Version 0.12.0 2015-12-22

- Support to refresh OAuth Token.
- Adding PHP & Python buildpacks.
- Package.json refactoring

Pull Requests:

@jthomas:

- Support for Service Instances
- Support for Services
- Support for ServicePlans
- Support for filters in Events

Environment: LOCAL_INSTANCE_1

  89 passing (3m)
  33 pending

Environment: PIVOTAL

  82 passing (4m)
  29 pending

Environment: BLUEMIX

  82 passing (4m)
  29 pending


## Version 0.11.1 2015-11-23

- Defensive code in HttpUtils.js (Avoid crashing in case of Server down or service not reply expected JSON)

## Version 0.11.0 2015-11-20

- Refactor some methods:

``` js
Apps.prototype.create = function (token_type, access_token, appOptions) {
Apps.prototype.add = function (token_type, access_token, appOptions) {

Apps.prototype.stopApp = function (token_type, access_token, app_guid) {
Apps.prototype.stop = function (token_type, access_token, app_guid) {

Apps.prototype.startApp = function (token_type, access_token, app_guid) {
Apps.prototype.start = function (token_type, access_token, app_guid) {

Apps.prototype.deleteApp = function (token_type, access_token, app_guid) {
Apps.prototype.remove = function (token_type, access_token, app_guid) {

Apps.prototype.uploadApp = function (token_type, access_token, app_guid, filePath, async) {
Apps.prototype.upload = function (token_type, access_token, app_guid, filePath, async) {

Apps.prototype.environmentVariables = function (token_type, access_token, app_guid) {
Apps.prototype.getEnvironmentVariables = function (token_type, access_token, app_guid) {

Organizations.prototype.memoryUsage = function (token_type, access_token, org_guid) {
Organizations.prototype.getMemoryUsage = function (token_type, access_token, org_guid) {

Organizations.prototype.summary = function (token_type, access_token, org_guid) {
Organizations.prototype.getSummary = function (token_type, access_token, org_guid) {

OrganizationsQuota.prototype.quotaDefinitions = function (token_type, access_token) {
OrganizationsQuota.prototype.getQuotaDefinitions = function (token_type, access_token) {

OrganizationsQuota.prototype.quotaDefinition = function (token_type, access_token, org_guid) {
OrganizationsQuota.prototype.getQuotaDefinition = function (token_type, access_token, org_guid) {

Routes.prototype.addRoute = function (token_type, access_token, routeOptions) {
Routes.prototype.add = function (token_type, access_token, routeOptions) {

Routes.prototype.deleteRoute = function (token_type, access_token, route_guid) {
Routes.prototype.remove = function (token_type, access_token, route_guid) {

ServiceBindings.prototype.removeServiceBinding = function (token_type, access_token, service_guid){
ServiceBindings.prototype.remove = function (token_type, access_token, service_guid) {

Spaces.prototype.summary = function (token_type, access_token, space_guid) {
Spaces.prototype.getSummary = function (token_type, access_token, space_guid) {

Spaces.prototype.userRoles = function (token_type, access_token, space_guid) {
Spaces.prototype.getUserRoles = function (token_type, access_token, space_guid) {

SpacesQuota.prototype.quotaDefinitions = function (token_type, access_token) {
SpacesQuota.prototype.getQuotaDefinitions = function (token_type, access_token) {

UserProvidedServices.prototype.create = function (token_type, access_token, user_provided_service_options) {
UserProvidedServices.prototype.add = function (token_type, access_token, user_provided_service_options) {

UserProvidedServices.prototype.delete = function (token_type, access_token, service_guid) {
UserProvidedServices.prototype.remove = function (token_type, access_token, service_guid) {

Users.prototype.getUsers = function (token_type, access_token, user_guid) {
Users.prototype.getUsers = function (token_type, access_token) {
```
Environment: LOCAL_INSTANCE_1

  72 passing (2m)
  26 pending

Environment: PIVOTAL

  64 passing (5m)
  21 pending

Environment: BLUEMIX

  64 passing (5m)
  21 pending

## Version 0.10.0 2015-11-06

- Adding Online documentation: http://prosociallearneu.github.io/cf-nodejs-client-docs/
- Add method to restage Apps
- Refactor methods:
UserProvidedServices.prototype.create
Routes.prototype.checkRoute & Routes.prototype.getRoutes
Logs.prototype.getRecent
CloudFoundry.prototype.login
Apps.prototype.associateRoute
Apps.prototype.associateRoute
Apps.prototype.stopApp & Apps.prototype.startApp
Apps.prototype.getAppByName
Apps.prototype.getApps
Routes.prototype.addRoute
Routes.prototype.checkRoute

Environment: LOCAL_INSTANCE_1

  71 passing (2m)
  25 pending

Environment: PIVOTAL

  63 passing (4m)
  20 pending

Environment: BLUEMIX

  63 passing (4m)
  20 pending


## Version 0.9.1 2015-10-29

- Adding the dependency Bluebird to improve the performance
- Adding support for Quotas (Org/Space)
- It is possible to create users in the system. (Quota/Org/Space/User)

Environment: LOCAL_INSTANCE_1

  65 passing (2m)
  23 pending

Environment: PIVOTAL

  58 passing (3m)
  19 pending

Environment: BLUEMIX

  58 passing (3m)
  19 pending

## Version 0.9.0 2015-10-23

- Adding support for Java Buildpack
- Testing development in 3 environments: Local Instance (Yudai), PSW & Bluemix
- Initial support for Organizations & Spaces

Environment: LOCAL_INSTANCE_1

  57 passing (1m)
  16 pending

Environment: PIVOTAL

  57 passing (1m)
  16 pending

Environment: BLUEMIX

  57 passing (4m)
  16 pending  

## Version 0.8.3 2015-10-19

- Adding the capability to add filters in a Service Binding Search.

  39 passing (1m)
  15 pending

## Version 0.8.2 2015-10-19

- Minor fix in index.js to export UserProvidedServices in the right way.

  39 passing (2m)
  14 pending

## Version 0.8.1 2015-10-01

- Adding adding method in the whole project: setEndPoint

  39 passing (2m)
  14 pending

## Version 0.8.0 2015-09-28

- Adding support for User Provided Services
- Adding support for Service Binding

  39 passing (1m)
  14 pending

## Version 0.7.0 2015-09-10

- Big performance improvement in tests.
- Remove the usage of process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
- Initial Log support

  37 passing (2m)
  6 pending

## Version 0.6.2 2015-09-04

- CloudFoundry.setEndpoint (0.6.1)
- App.uploadApp with async flag
- App.uploadApp without the useless parameter appName

  35 passing (3m)
  4 pending

## Version 0.0.6 2015-08-20

- Better support for: Create App, Upload Bits for App & Start App

  32 passing (3m)
  3 pending

## Version 0.0.5 2015-08-14

- Pending

  16 passing (23s)
  3 pending

