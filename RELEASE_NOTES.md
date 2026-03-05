# cf-node-client v1.0.7 — 7 v3 API Fixes (4 MEDIUM + 3 LOW)

**Package**: cf-node-client v1.0.7  
**Release Date**: March 5, 2026  
**Status**: Production Ready  
**Severity**: **Medium/Low — v3 Status Code, Job Polling, Consistency**

## What's Fixed in v1.0.7

Implements all remaining audit findings for v3 API correctness and robustness. Adds support for dual status codes, v3 async job polling, and improves v3/v2 consistency.

### MEDIUM — Dual Status Codes, Job Polling

| ID | File | Method | Before | After |
|----|------|--------|--------|-------|
| M1+L3 | Jobs.js | v3 async jobs | No polling for /v3/jobs/:guid | Added getV3Job(), pollJob() |
| M2 | AppsDeployment.js | removeServiceBindings() | expects 204 | expects **202 or 204** |
| M3 | ServiceBindings.js | _addV3/_removeV3 | expects 201/202 only | expects **201 or 202** (add), **202 or 204** (remove) |
| M4 | ServiceInstances.js | _removeV3 | expects 202 only | expects **202 or 204** |

### LOW — Consistency & Docs

| ID | File | Issue | Fix |
|----|------|-------|-----|
| L1 | Organizations.js | v3 private domains filter | Removed ineffective visibility=private |
| L2 | Organizations.js | inconsistent auth header | All v2/v3 methods use getAuthorizationHeader() |
| L3 | Jobs.js | endpoint map/docs | Clarified v3 jobs vs tasks |

### Enabler
- **HttpUtils.js:** `request()` now accepts `Number|Number[]` for status codes (enables dual-status handling above).

### Tests
- 27 new unit tests in `test/lib/V3AuditFixMediumLowTests.js`
- All **139 tests passing**, 0 failing

---

# cf-node-client v1.0.6 — Fix 9 v3 API Issues (5 CRITICAL + 4 HIGH)

**Package**: cf-node-client v1.0.6  
**Release Date**: March 5, 2026  
**Status**: Production Ready  
**Severity**: **Critical — v3 Status Code & Request Body Corrections**

## What's Fixed in v1.0.6

Full library audit against the [CF API v3 specification](https://v3-apidocs.cloudfoundry.org/) found 9 issues causing runtime failures or API rejections when using v3 mode. All fixed.

### CRITICAL — Wrong HTTP Status Expectations (C1–C4)

CF v3 DELETE operations return `202 Accepted` (with async job URL), not `204 No Content`. The library was rejecting successful deletions.

| ID | File | Method | Before | After |
|----|------|--------|--------|-------|
| C1 | AppsCore.js | `remove()` | expects 204 | expects **202** |
| C2 | Domains.js | `remove()` | expects 204 | expects **202** |
| C3 | BuildPacks.js | `remove()` | expects 204 | expects **202** |
| C4 | Users.js | `remove()` | expects 204 | expects **202** |

### CRITICAL — Upload Method Mismatch (C5)

| ID | File | Issue | Fix |
|----|------|-------|-----|
| C5 | HttpUtils.js | `upload()` hardcoded `PUT` | Now accepts `options.method` (default: PUT). AppsDeployment v3 passes `POST` for `/v3/packages/:guid/upload`. |

### HIGH — Wrong v3 Request Body Structure (H1–H4)

| ID | File | Method | Before (broken) | After (correct) |
|----|------|--------|-----------------|-----------------|
| H1 | Domains.js | `add()` | `{ organization_guid: "..." }` | `{ relationships: { organization: { data: { guid: "..." } } } }` |
| H2 | Users.js | `add()` | `{ username, origin }` | `{ guid: "uaa-user-guid" }` |
| H3 | OrganizationsQuota.js | `_translateToV3()` | flat `limits` object | nested `apps`, `services`, `routes`, `domains` sub-objects |
| H4 | SpacesQuota.js | `_translateToV3()` | flat `limits` object | nested `apps`, `services`, `routes` sub-objects |

### Breaking Changes

- **`Users.add()` v3 body**: Now requires `{ guid: "uaa-user-guid" }` instead of `{ username, origin }`. This matches the CF v3 spec. If you were passing `{ guid: "..." }`, it works as before. If you relied on `username` / `origin` fields being sent to v3, update your caller code.
- **`OrganizationsQuota` / `SpacesQuota` v3 body**: The `_translateToV3()` internal method now produces the correct nested structure. If you were passing v2-style options (`memory_limit`, `total_services`, etc.), the translation is now correct — no caller changes needed.

### Tests
- 19 new unit tests in `test/lib/V3AuditFixTests.js`
- All **112 tests passing**, 0 failing

---

# cf-node-client v1.0.5 — Fix 11 Incorrect v3 API Endpoints

**Package**: cf-node-client v1.0.5  
**Release Date**: March 5, 2026  
**Status**: Production Ready  
**Severity**: **Important — v3 Endpoint Corrections**

## What's Fixed in v1.0.5

Full audit of all 30 library files found 11 incorrect v3 API endpoints across 3 files. All corrected to match the official [CF API v3 specification](https://v3-apidocs.cloudfoundry.org/).

### AppsDeployment.js — 4 Fixes

| Method | Before (broken) | After (correct) |
|--------|-----------------|-----------------|
| `getStats()` | `/v3/apps/:guid/stats` | `/v3/apps/:guid/processes/web/stats` |
| `associateRoute()` | `PUT /v3/apps/:guid/routes/:routeGuid` | `POST /v3/routes/:routeGuid/destinations` with body |
| `getServiceBindings()` | `/v3/apps/:guid/service_credential_bindings` | `/v3/service_credential_bindings?app_guids=:guid` |
| `_uploadV3()` | Single-step upload | 2-step: create package → upload bits |

### Organizations.js — 3 Fixes

| Method | Before (broken) | After (correct) |
|--------|-----------------|-----------------|
| `_getUsersV3()` | `/v3/organizations/:guid/relationships/users` | `/v3/roles?organization_guids=:guid&types=organization_user` |
| `_getManagersV3()` | `/v3/organizations/:guid/relationships/managers` | `/v3/roles?organization_guids=:guid&types=organization_manager` |
| `_getAuditorsV3()` | `/v3/organizations/:guid/relationships/auditors` | `/v3/roles?organization_guids=:guid&types=organization_auditor` |

### Spaces.js — 4 Fixes

| Method | Before (broken) | After (correct) |
|--------|-----------------|-----------------|
| `_getUsersV3()` | `/v3/spaces/:guid/relationships/members` | `/v3/roles?space_guids=:guid` |
| `_getManagersV3()` | `/v3/spaces/:guid/relationships/managers` | `/v3/roles?space_guids=:guid&types=space_manager` |
| `_getDevelopersV3()` | `/v3/spaces/:guid/relationships/developers` | `/v3/roles?space_guids=:guid&types=space_developer` |
| `_getAuditorsV3()` | `/v3/spaces/:guid/relationships/auditors` | `/v3/roles?space_guids=:guid&types=space_auditor` |

### Additional Enhancement

- **`Spaces.getSpaceApps(guid, filter)`**: Added backward-compatibility alias for `Spaces.getApps()` so existing consumer code continues to work.

### Audit Scope

27 additional files scanned and confirmed clean — no issues found.

### Tests
- All **93 tests passing**, 0 failing

---

# cf-node-client v1.0.4 — Hotfix: v3 getInfo() Broken Authentication Flow

**Package**: cf-node-client v1.0.4  
**Release Date**: March 5, 2026  
**Status**: Production Ready  
**Severity**: **Critical Hotfix**

## What's Fixed in v1.0.4

### Bug Fix — `getInfo()` Returns `undefined` for `authorization_endpoint` (v3 Mode)

**Impact**: All users on v1.0.0+ using default v3 mode. The standard authentication flow was completely broken:

```javascript
// This common pattern was broken in v3 mode:
const info = await cfController.getInfo();
usersUAA.setEndPoint(info.authorization_endpoint);  // ❌ undefined → Error thrown
```

**Root Cause**: `CloudController.getInfo()` called `/v3/info` which does not exist in Cloud Foundry. CF v3 uses the root endpoint `/` which returns a different response shape:
- v2: `{ authorization_endpoint: "https://...", token_endpoint: "https://..." }`
- v3 root: `{ links: { uaa: { href: "https://..." }, login: { href: "https://..." } } }`

**Fix**: `getInfo()` in v3 mode now calls the correct root endpoint `/` and **normalizes** the response by adding `authorization_endpoint` and `token_endpoint` at the top level. All existing consumer code works without changes.

### New Convenience Method — `getAuthorizationEndpoint()`

A version-agnostic helper that extracts the UAA endpoint from CF info. Recommended for new code:

```javascript
// Old pattern (still works):
const info = await cfController.getInfo();
usersUAA.setEndPoint(info.authorization_endpoint);

// New pattern (cleaner):
const authEndpoint = await cfController.getAuthorizationEndpoint();
usersUAA.setEndPoint(authEndpoint);
```

### Files Modified

| File | Change |
|------|--------|
| `lib/model/cloudcontroller/CloudController.js` | Fixed `getInfo()` v3 endpoint + response normalization; added `getAuthorizationEndpoint()` |
| `types/index.d.ts` | Added `getAuthorizationEndpoint(): Promise<string>` type declaration |
| `examples/cf-service-usage-example.js` | Added `getAuthTokenV2()` example using new convenience method |

### Tests
- All **93 tests passing**, 0 failing

---

# cf-node-client v1.0.2 — Security: Zero Vulnerabilities

**Package**: cf-node-client v1.0.2  
**Release Date**: March 5, 2026  
**Status**: Production Ready

## What's New in v1.0.2

### Security — 41 Vulnerabilities → 0

| Action | Details |
|--------|--------|
| **Removed** 6 devDeps | `grunt`, `grunt-cli`, `grunt-connect`, `grunt-jsdoc`, `grunt-open`, `istanbul` |
| **Upgraded** 5 devDeps | `mocha` 2→10, `chai` 3→4, `chai-as-promised` 5→7, `nconf` 0.8→0.13, `archiver` 0.20→7 |
| **Added** 2 overrides | `minimist` ^1.2.8, `serialize-javascript` ^7.0.3 |
| **Migrated** config | `test/mocha.opts` → `.mocharc.yml` |

All **93 tests passing**, ESLint clean, `npm audit` reports **0 vulnerabilities**.

---

# cf-node-client v1.0.1 — Auto-Pagination & Memory Cache

**Package**: cf-node-client v1.0.1  
**Release Date**: March 5, 2026  
**Status**: Production Ready

## What's New in v1.0.1

### Auto-Pagination (`getAllResources`)

No more manual pagination loops. The library now auto-paginates through every page and returns a flat array of all resources:

```javascript
const allOrgs   = await orgs.getAllOrganizations();
const allSpaces = await spaces.getAllSpaces();
const allApps   = await apps.getAllApps({ q: "space_guid:xxx" });
const allSIs    = await si.getAllInstances();
```

- Handles both **v2** (`next_url`) and **v3** (`pagination.next`) transparently
- v3 fetches 200 per page; v2 fetches 100 per page
- Generic `getAllResources(fetchFn, filter)` in `CloudControllerBase` for custom endpoints
- Thin wrappers: `getAllOrganizations()`, `getAllSpaces()`, `getAllApps()`, `getAllInstances()`

### Memory Cache (Opt-in)

Built-in in-memory cache with per-entry TTL to reduce redundant API calls:

```javascript
// Enable at construction
const orgs = new Organizations(api, { cache: true, cacheTTL: 60000 });

// Or toggle at runtime
orgs.enableCache(30000);  // 30 s TTL
orgs.clearCache();        // clear entries, keep cache on
orgs.disableCache();      // off + clear
```

- Map-based store with lazy expiration
- Default TTL: 30 000 ms (30 s)
- Per-entry TTL override via `CacheService.set(key, value, ttlMs)`
- Prefix invalidation via `CacheService.invalidateByPrefix(prefix)`

### TypeScript Types Updated

All new APIs have full type declarations in `types/index.d.ts`:
- `CloudControllerBaseOptions.cache` / `cacheTTL`
- `enableCache()`, `disableCache()`, `clearCache()`, `getAllResources()`
- `getAllOrganizations()`, `getAllSpaces()`, `getAllApps()`, `getAllInstances()`
- Exported `CacheService` class type

### Tests

- **93 passing**, 0 failing, lint clean
- 8 CacheService unit tests
- 8 auto-pagination tests (v2 + v3)
- 5 cache integration tests

### Updated Documentation & Examples

- `examples/cf-service-usage-example.js` — sections 8 (Auto-Pagination) & 9 (Memory Cache)
- `examples/typescript-basic.ts` — pagination + cache examples
- `examples/typescript-advanced.ts` — replaced manual `getAllPages()` with built-in methods
- `docs/Usage.md` — new "Auto-Pagination" & "Memory Cache" sections
- `docs/Usage-cf-service.md` — migration note for `getAllResources`
- `README.md` — new "Auto-Pagination" & "Memory Cache" sections

### New Files

| File | Purpose |
|------|---------|
| `lib/services/CacheService.js` | Map-based in-memory cache with per-entry TTL |
| `test/lib/PaginationCacheTests.js` | 21 tests for cache, pagination, integration |

### Modified Files

| File | Change |
|------|--------|
| `lib/model/cloudcontroller/CloudControllerBase.js` | `getAllResources()`, cache methods, `_cachedFetch()` |
| `lib/model/cloudcontroller/Organizations.js` | `getAllOrganizations(filter)` |
| `lib/model/cloudcontroller/Spaces.js` | `getAllSpaces(filter)` |
| `lib/model/cloudcontroller/AppsCore.js` | `getAllApps(filter)` |
| `lib/model/cloudcontroller/ServiceInstances.js` | `getAllInstances(filter)` |
| `types/index.d.ts` | Cache + pagination type declarations |

---

# cf-node-client v1.0.0 - Migration Complete ✅

**Package**: cf-node-client v1.0.0  
**Release Date**: March 4, 2026  
**Status**: Production Ready

## What's New in v1.0.0

### 🎯 API v3 Migration Complete
cf-node-client v1.0.0 brings full Cloud Foundry API v3 support while maintaining complete backward compatibility with the v2 API.

### 📊 Migration Statistics
- **14 Cloud Controller Models**: Apps, Organizations, Spaces, Services, ServiceInstances, Routes, ServiceBindings, Domains, BuildPacks, Stacks, Users, Events, Jobs, Quotas (Org & Space)
- **75+ Public Methods**: All with dual v2/v3 support
- **~7,000+ Lines**: Of production-ready code
- **Zero Breaking Changes**: v2 API fully preserved
- **100% Backward Compatible**: Existing code continues to work

### ✨ Key Features

#### 1. Default v3 API Support
```javascript
const cf = new CloudController('https://api.example.com');
cf.setToken(token);

// v3 is now the default - modern, better performance
cf.getApps(filters);  // Uses /v3/apps endpoint
```

#### 2. Backward Compatibility with v2
```javascript
// For legacy systems, explicitly use v2
cf.setApiVersion('v2');
cf.getApps(filters);  // Uses /v2/apps endpoint

// Switch back to v3 anytime
cf.setApiVersion('v3');
```

#### 3. Intelligent Endpoint Mapping
Automatic handling of renamed endpoints:
- `services` → `service_offerings` (v3)
- `events` → `audit_events` (v3) 
- `jobs` → `tasks` (v3)
- `quota_definitions` → `organization_quotas` (v3)
- `space_quota_definitions` → `space_quotas` (v3)

#### 4. Smart Field Translation
Automatic conversion between v2 and v3 field formats:
- v2: `state: 'STARTED'` ↔ v3: `stopped: false`
- v2: `memory` (integer) ↔ v3: `memory_in_mb` (units)
- v2 form-urlencoded ↔ v3 JSON payload

## Migration Guide

### For New Code
Use v3 API (default):
```javascript
const CloudController = require('cf-node-client').CloudController;
const cf = new CloudController('https://api.example.com');
cf.setToken(oauthToken);
```

### For Existing Code
No changes required! Your existing v2 code continues to work without modification:
```javascript
// This continues to work exactly as before
cf.setApiVersion('v2');
cf.getOrganizations();
```

### Gradual Migration Path
1. Upgrade to v1.0.0 (no code changes needed)
2. Pick one module, switch to v3:
   ```javascript
   const Apps = require('cf-node-client').Apps;
   const apps = new Apps(endpoint, token);
   // Already using v3 by default!
   ```
3. Incrementally migrate other modules
4. Remove `setApiVersion('v2')` calls when ready

## Breaking Changes

### ⚠️ Package Name Change
**Old:** `npm install cf-nodejs-client`  
**New:** `npm install cf-node-client`

The old package `cf-nodejs-client` is no longer maintained. If you're upgrading:
```bash
npm remove cf-nodejs-client
npm install cf-node-client@1.0.0
```

Update your require statements:
```javascript
// From:
const lib = require('cf-nodejs-client');

// To:
const lib = require('cf-node-client');
```

### Version Requirement
- Node.js 10.0.0 or higher recommended
- Tested on Node.js 14, 16, 18

## API v3 Improvements Over v2

### Performance
- **Relationship queries**: v3 includes related resources in single request
- **Filtering**: Rich query parameter support on v3 endpoints
- **Pagination**: Improved pagination with consistent cursor-based navigation

### Feature Additions
- **Metadata**: Resources include metadata (created_at, updated_at, links)
- **Filtering**: Native filtering on relationships (spaces, orgs, etc.)
- **Relationships**: Type-safe relationship navigation
- **Task Management**: v3 /tasks endpoint for background job execution
- **Audit Events**: New /audit_events endpoint for compliance

### Developer Experience
- **JSON**: All requests/responses are JSON (v2 mixed form-urlencoded)
- **Consistency**: Uniform response structure across all endpoints
- **Documentation**: Better OpenAPI/Swagger compatibility
- **Debugging**: Easier to work with in modern tools and libraries

## Detailed Changelog

### Phase 1-3: Foundation (v0.13.0 → v1.0.0-rc1)
- ✅ ApiConfig system for version management
- ✅ ApiVersionManager with 16+ resource mappings
- ✅ CloudControllerBase enhanced with v3 methods
- ✅ HttpUtils dual-request framework (requestV2/requestV3)

### Phase 4: Cloud Controller Models (v1.0.0-rc1 → v1.0.0-rc2)
**Tier 1:** Apps (already dual-supported)

**Tier 2:** Domains, BuildPacks
- 4 methods each (list, get, add/update, remove)
- Endpoint mapping: `/v2/domains` ↔ `/v3/domains`
- Endpoint mapping: `/v2/buildpacks` ↔ `/v3/buildpacks`

**Tier 3:** Stacks, Users, Events, Jobs
- 2-4 methods each
- Events: `/v2/events` → `/v3/audit_events` (renamed endpoint)
- Jobs: `/v2/jobs` → `/v3/tasks` (renamed endpoint)
- Read-only: Stacks (list, get only)

**Tier 4:** OrganizationsQuota, SpacesQuota
- 5 methods each (full CRUD)
- OrganizationsQuota: `/v2/quota_definitions` → `/v3/organization_quotas`
- SpacesQuota: `/v2/space_quota_definitions` → `/v3/space_quotas`

**Tier 1-3:** Organizations, Spaces, Services, ServiceInstances, Routes, ServiceBindings
- 7-11 methods each
- Full dual v2/v3 implementation
- Relationship queries for nested resources

### Phase 5: Metrics & UAA Verification (v1.0.0-rc2)
- ✅ Logs.js (Metrics API) - independent endpoint, no changes needed
- ✅ UsersUAA.js (UAA API) - separate service, v2/v3 agnostic

### Phase 6: Comprehensive Tests (v1.0.0-rc3 → v1.0.0)
- ✅ 40+ unit tests covering v2/v3 switching
- ✅ Config management tests  
- ✅ Endpoint mapping verification
- ✅ Model instantiation tests
- ✅ Backward compatibility validation
- ✅ Feature parity assertion
- Test framework: Mocha + Chai

### Phase 8: Package Rename & Release (v1.0.0)
- ✅ Package name: `cf-nodejs-client` → `cf-node-client`
- ✅ Updated all metadata (homepage, repository, bugs)
- ✅ Version: 1.0.0 (from 0.13.0)
- ✅ Clean git history with descriptive commits

## Tested & Verified

✅ All 14 Cloud Controller models compile  
✅ All models support v2 and v3  
✅ Version switching works correctly  
✅ Backward compatibility maintained  
✅ Package metadata updated  
✅ Zero dependencies added  

## Known Limitations & Future Work

### v2-Only Operations (Return Explicit Errors)
- Organization service access control (v2 specific)
- Service instance permissions (v2 specific)
- Some UAA-specific operations

### v3 Roadmap
- Task lifecycle webhooks
- Advanced filtering syntax
- Resource attributes framework
- Rate limiting v3 headers
- Better error response codes

## Support & Community

### Getting Help
- **GitHub Issues**: Report bugs at[cf-node-client issues](https://github.com/cloudfoundry-community/cf-node-client)
- **Documentation**: See [Usage Guide](./Usage.md)
- **Examples**: Check [examples/](../examples/) directory

### Contributing
Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Submit a pull request

## License

Apache License 2.0 - See [LICENSE](../LICENSE) file

---

## Quick Start

### Installation
```bash
npm install cf-node-client@1.0.0
```

### Basic Usage
```javascript
const CloudController = require('cf-node-client').CloudController;

const endpoint = 'https://api.example.com';
const cf = new CloudController(endpoint);

cf.setToken({
    token_type: 'Bearer',
    access_token: 'your-oauth-token'
});

// List apps (using v3 by default)
cf.getApps().then(apps => {
    console.log('Apps:', apps);
});
```

### Version Switching
```javascript
// Explicitly use v2 API if needed
cf.setApiVersion('v2');
cf.getApps();  // Uses /v2/apps

// Switch back to v3
cf.setApiVersion('v3');
cf.getApps();  // Uses /v3/apps
```

---

**Thank you for using cf-node-client! Happy deploying! 🚀**
