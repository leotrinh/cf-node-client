# CF v3 API Full Audit Report

**Date:** 2025-01-XX
**Scope:** All 30+ library files in `lib/` vs CF v3 API v3.209.0
**Reference:** https://v3-apidocs.cloudfoundry.org/version/3.209.0/index.html
**Goal:** Identify remaining edge cases, incorrect request/response handling for stable release

---

## Executive Summary

Audited **30 files** across `lib/model/cloudcontroller/`, `lib/model/uaa/`, `lib/model/metrics/`, `lib/services/`, `lib/config/`, `lib/utils/`. Found **16 issues** across 4 severity levels:

| Severity | Count | Impact |
|----------|-------|--------|
| **CRITICAL** | 5 | Wrong HTTP status code → runtime failure |
| **HIGH** | 4 | Wrong request body → CF API rejects |
| **MEDIUM** | 4 | Design/semantic mismatch |
| **LOW** | 3 | Won't crash but technically incorrect |

---

## CRITICAL Issues (5) — Wrong status code → will throw at runtime

### C1. AppsCore.remove() v3 — Wrong expected status
- **File:** `lib/model/cloudcontroller/AppsCore.js` line ~247
- **Current:** Expects `204 No Content`
- **CF v3 spec:** `DELETE /v3/apps/:guid` → **202 Accepted** (async, returns job URL in Location header)
- **Impact:** Every v3 app deletion throws a status mismatch error

### C2. Domains.remove() v3 — Wrong expected status
- **File:** `lib/model/cloudcontroller/Domains.js` line ~100
- **Current:** `requestV3("DELETE", ..., this.HttpStatus.NO_CONTENT)` → expects 204
- **CF v3 spec:** `DELETE /v3/domains/:guid` → **202 Accepted** (async with job)
- **Impact:** Every v3 domain deletion throws

### C3. BuildPacks.remove() v3 — Wrong expected status
- **File:** `lib/model/cloudcontroller/BuildPacks.js` line ~130
- **Current:** `requestV3("DELETE", ..., this.HttpStatus.NO_CONTENT)` → expects 204
- **CF v3 spec:** `DELETE /v3/buildpacks/:guid` → **202 Accepted** (async with job)
- **Impact:** Every v3 buildpack deletion throws

### C4. Users.remove() v3 — Wrong expected status
- **File:** `lib/model/cloudcontroller/Users.js` line ~96
- **Current:** `requestV3("DELETE", ..., this.HttpStatus.NO_CONTENT)` → expects 204
- **CF v3 spec:** `DELETE /v3/users/:guid` → **202 Accepted** (async)
- **Impact:** Every v3 user deletion throws

### C5. HttpUtils.upload() hardcodes PUT method
- **File:** `lib/utils/HttpUtils.js` line ~224
- **Current:** `const fetchOpts = { method: "PUT", ... }` — always PUT
- **CF v3 spec:** `POST /v3/packages/:guid/upload` requires **POST**, not PUT
- **Why it matters:** v2 bits upload uses `PUT /v2/apps/:guid/bits` (correct), but v3 package upload needs POST. Sending PUT to `/v3/packages/:guid/upload` likely returns 405 Method Not Allowed.
- **Impact:** All v3 file uploads fail

---

## HIGH Issues (4) — Wrong request body → API rejects or misinterprets

### H1. Domains.add() v3 — Wrong body structure for private domains
- **File:** `lib/model/cloudcontroller/Domains.js` line ~80
- **Current:**
  ```json
  { "name": "...", "internal": false, "organization_guid": "org-guid" }
  ```
- **CF v3 spec requires:**
  ```json
  {
    "name": "...",
    "internal": false,
    "relationships": { "organization": { "data": { "guid": "org-guid" } } }
  }
  ```
- **Impact:** Creating private (org-scoped) domains fails; `organization_guid` as flat field is ignored by v3

### H2. Users.add() v3 — Wrong body fields
- **File:** `lib/model/cloudcontroller/Users.js` line ~78
- **Current:**
  ```json
  { "username": "...", "origin": "uaa" }
  ```
- **CF v3 spec requires:**
  ```json
  { "guid": "uaa-user-guid" }
  ```
- **Impact:** CC v3 `POST /v3/users` expects the UAA user GUID in a `guid` field. Sending `username`/`origin` causes API error.

### H3. OrganizationsQuota._translateToV3() — Wrong body structure
- **File:** `lib/model/cloudcontroller/OrganizationsQuota.js` line ~140
- **Current:** Flat `limits` object:
  ```json
  { "name": "...", "limits": { "memory_limit_in_gb": 10, "process_memory_limit_in_mb": 1024 } }
  ```
- **CF v3 spec requires:** Nested quota structure:
  ```json
  {
    "name": "...",
    "apps": { "total_memory_in_mb": 10240, "per_process_memory_in_mb": 1024, "total_instances": ... },
    "services": { "total_service_instances": ..., "total_service_keys": ... },
    "routes": { "total_routes": ..., "total_reserved_ports": ... },
    "domains": { "total_domains": ... }
  }
  ```
- **Impact:** Create/update org quotas in v3 fails — field names and structure don't match

### H4. SpacesQuota._translateToV3() — Same wrong body structure
- **File:** `lib/model/cloudcontroller/SpacesQuota.js` line ~135
- **Same issue as H3** — flat `limits` object instead of nested `apps`/`services`/`routes` structure
- **CF v3 spec for space quotas:** Same nested structure as org quotas

---

## MEDIUM Issues (4) — Design/semantic mismatch

### M1. Jobs class conflates v2 Jobs with v3 Tasks
- **File:** `lib/model/cloudcontroller/Jobs.js`
- **Problem:** In CF v3, **Jobs** (`/v3/jobs/:guid`) and **Tasks** (`/v3/tasks`) are **completely different** resources:
  - **Jobs** = async background operations (delete org, delete space, etc.) — poll for completion
  - **Tasks** = one-off commands run inside an app container (like `cf run-task`)
- **Current code:** `getJobs()`/`getJob()` hit `/v3/tasks` instead of `/v3/jobs`. The `add()` and `cancel()` methods correctly work with tasks.
- **Impact:** No way to poll v3 async job status. If consumer calls `org.remove()` (returns 202 with job URL) and then `jobs.getJob(jobGuid)`, it hits the wrong endpoint.
- **Fix suggestion:** Either rename class to `Tasks` or add separate `getJobStatus(guid)` method using `/v3/jobs/:guid`

### M2. AppsDeployment.removeServiceBindings() v3 — Status ambiguity
- **File:** `lib/model/cloudcontroller/AppsDeployment.js` line ~183
- **Current:** Expects 204 for all v3 unbinds
- **CF v3 spec:** `DELETE /v3/service_credential_bindings/:guid` returns:
  - **202 Accepted** for managed service bindings (async broker unbind)
  - **204 No Content** for user-provided service bindings (sync)
- **Impact:** Managed service unbinds throw status mismatch error

### M3. ServiceBindings add/remove status ambiguity
- **File:** `lib/model/cloudcontroller/ServiceBindings.js`
- `_addV3()` expects 201, but managed bindings can return 202 (async broker provision)
- `_removeV3()` expects 202, but user-provided unbinds return 204
- **Impact:** Intermittent failures depending on binding type

### M4. ServiceInstances._removeV3() — Always expects 202
- **File:** `lib/model/cloudcontroller/ServiceInstances.js` line ~350
- **Current:** Always expects 202 Accepted
- **CF v3 spec:** User-provided service instance deletion returns **204 No Content** (no broker)
- **Impact:** Deleting a user-provided service instance via `ServiceInstances.remove()` throws

---

## LOW Issues (3) — Minor/cosmetic, won't crash

### L1. Organizations._getPrivateDomainsV3() — Ineffective filter
- **File:** `lib/model/cloudcontroller/Organizations.js` line ~224
- **Current:** Passes `visibility=private` in query string
- **CF v3 API:** `/v3/organizations/:guid/domains` doesn't support a `visibility` filter (ignored silently)
- **Impact:** No filtering error, but the filter has no effect — returns all org domains, not just private

### L2. Inconsistent auth header construction
- **Files:** Multiple (Organizations.js, Spaces.js, Routes.js, etc.)
- **Some methods use:** `this.getAuthorizationHeader()` (the safe helper)
- **Others use:** `` `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}` `` (direct access, no null check)
- **Impact:** Direct access can throw cryptic `Cannot read property 'token_type' of undefined` instead of the helpful "Token not set" error

### L3. ApiVersionManager jobs endpoint inconsistency
- **File:** `lib/config/ApiVersionManager.js` line ~24
- **Endpoint map:** `jobs: { v2: "/v2/jobs", v3: "/v3/jobs" }` — correct mapping
- **But Jobs.js ignores this map** and hardcodes `/v3/tasks`
- **Impact:** `buildResourceUrl("jobs")` returns correct `/v3/jobs` URL but class doesn't use it

---

## Classes Confirmed Clean ✅

| Class | Status | Notes |
|-------|--------|-------|
| CloudControllerBase | ✅ Clean | Pagination, cache, token mgmt all correct |
| CloudController | ✅ Clean | getInfo(), feature flags all correct |
| AppsCore (except remove) | ✅ Clean | CRUD, lifecycle, getAppByName all correct |
| AppsDeployment (except upload/removeBindings) | ✅ Clean | Stats, routes, env vars, droplets, packages correct |
| AppsCopy | ✅ Clean | copyPackage, downloadBits, downloadDroplet all correct |
| Apps (facade) | ✅ Clean | Mixin pattern works correctly |
| Organizations (except private domains filter) | ✅ Clean | CRUD, users/managers/auditors roles correct |
| Spaces | ✅ Clean | CRUD, apps, users/managers/devs/auditors correct |
| Routes | ✅ Clean | CRUD, destinations mapping correct |
| Services | ✅ Clean | service_offerings mapping correct, plans via filter |
| ServicePlans | ✅ Clean | Plans + instances via filter correct |
| Events | ✅ Clean | audit_events mapping correct |
| Stacks | ✅ Clean | Simple list/get, no issues |
| UserProvidedServices | ✅ Clean | type=user-provided filter, bindings via filter |
| UsersUAA | ✅ Clean | UAA-specific endpoints, not CC v3 |
| Logs | ✅ Clean | Logging endpoint, outside CC API scope |
| HttpUtils (except upload method) | ✅ Clean | request(), requestV3(), requestV2() all correct |
| ApiConfig | ✅ Clean | Simple config holder |
| CacheService | ✅ Clean | Proper TTL cache |
| ConfigManagerService | ✅ Clean | Factory |
| ErrorService | ✅ Clean | Simple error helper |
| CfIgnoreHelper | ✅ Clean | .cfignore parsing |
| HttpStatus | ✅ Clean | Constants |
| HttpMethods | ✅ Clean | Constants |

---

## Recommended Fix Priority

### Phase 1 — CRITICAL fixes (must fix before stable)
1. Fix 5 wrong status codes (C1–C4 → change to 202; C5 → make upload method configurable)
2. These are the most impactful because they cause **every call** to throw

### Phase 2 — HIGH fixes (must fix before stable)
3. Fix 4 wrong body structures (H1–H4)
4. These prevent correct creation/update of domains, users, and quotas in v3

### Phase 3 — MEDIUM fixes (recommended before stable)
5. Add v3 job polling capability (M1)
6. Handle dual status codes for service binding/instance operations (M2–M4)

### Phase 4 — LOW fixes (nice to have)
7. Remove ineffective visibility filter (L1)
8. Standardize auth header construction (L2)
9. Make Jobs class use ApiVersionManager endpoints (L3)

---

## Quick-Fix Table

| # | File | Method | Current | Should Be |
|---|------|--------|---------|-----------|
| C1 | AppsCore.js | remove() v3 | `HttpStatus.NO_CONTENT` (204) | `HttpStatus.ACCEPTED` (202) |
| C2 | Domains.js | remove() v3 | `HttpStatus.NO_CONTENT` (204) | `HttpStatus.ACCEPTED` (202) |
| C3 | BuildPacks.js | remove() v3 | `HttpStatus.NO_CONTENT` (204) | `HttpStatus.ACCEPTED` (202) |
| C4 | Users.js | remove() v3 | `HttpStatus.NO_CONTENT` (204) | `HttpStatus.ACCEPTED` (202) |
| C5 | HttpUtils.js | upload() | `method: "PUT"` | Accept method param, default POST for v3 |
| H1 | Domains.js | add() v3 | flat `organization_guid` | nested `relationships.organization.data` |
| H2 | Users.js | add() v3 | `{username, origin}` | `{guid: "uaa-guid"}` |
| H3 | OrganizationsQuota.js | _translateToV3() | flat `limits` | nested `apps/services/routes/domains` |
| H4 | SpacesQuota.js | _translateToV3() | flat `limits` | nested `apps/services/routes/domains` |
| M1 | Jobs.js | getJobs/getJob | `/v3/tasks` | Add `/v3/jobs/:guid` method |
| M2 | AppsDeployment.js | removeServiceBindings | expects 204 only | Handle 202 or 204 |
| M3 | ServiceBindings.js | add/remove v3 | fixed status | Handle 201/202 and 202/204 |
| M4 | ServiceInstances.js | _removeV3 | expects 202 only | Handle 202 or 204 |
