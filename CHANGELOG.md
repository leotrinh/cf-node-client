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

