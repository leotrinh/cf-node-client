# Fix Plan — 9 WARNING Findings from Code Review 250715

| Field | Value |
|-------|-------|
| **Date** | 2025-07-15 |
| **Source** | `docs/code-review/Code-Review-250715.md` |
| **Scope** | W-01 through W-09 (9 WARNING findings) |
| **Priority** | W-01 > W-02 > W-07 > W-04 > W-09 > W-06 > W-05 > W-08 > W-03 |

---

## Overview

9 WARNING findings from the lib/ code review. Grouped into 5 phases by dependency and complexity.

---

## Phase 1 — W-01: Fix Filter Silently Ignored in 8 V3 List Endpoints

**Impact:** MEDIUM — All v3 list calls ignore caller's filter → return unfiltered data.
**Root Cause:** `requestV3()` has no `qs` param support. V3 branches call `requestV3("GET", url, token)` dropping filter.
**Strategy:** Switch v3 branches from `requestV3()` to `this.REST.request()` with manual headers + qs. Same pattern already used successfully in ServicePlans.js / UserProvidedServices.js.

### Files & Changes

| # | File | Method | Current Code | Fix |
|---|------|--------|-------------|-----|
| 1 | `lib/model/cloudcontroller/Domains.js` L31 | `getDomains(filter)` | `requestV3("GET", url, token)` | Switch to `this.REST.request({...qs: filter \|\| {}})` |
| 2 | `lib/model/cloudcontroller/Users.js` L31 | `getUsers(filter)` | `requestV3("GET", url, token)` | Same pattern |
| 3 | `lib/model/cloudcontroller/Stacks.js` L30 | `getStacks(filter)` | `requestV3("GET", url, token)` | Same pattern |
| 4 | `lib/model/cloudcontroller/BuildPacks.js` L60 | `getBuildPacks(filter)` | `requestV3("GET", url, token)` | Same pattern |
| 5 | `lib/model/cloudcontroller/Jobs.js` L31 | `getJobs(filter)` | `requestV3("GET", url, token)` | Same pattern |
| 6 | `lib/model/cloudcontroller/OrganizationsQuota.js` L25 | `getOrganizationQuotas(filter)` | `requestV3("GET", url, token)` | Same pattern |
| 7 | `lib/model/cloudcontroller/SpacesQuota.js` L25 | `getSpaceQuotas(filter)` | `requestV3("GET", url, token)` | Same pattern |
| 8 | `lib/model/cloudcontroller/Events.js` L68 | `_getEventsV3(filter)` | `requestV3('GET', url, token)` | Same pattern |

### Target Code Pattern (v3 branch)

```javascript
// BEFORE (broken — filter dropped)
if (this.isUsingV3()) {
    return this.REST.requestV3("GET", `${this.API_URL}/v3/resource`, token);
}

// AFTER (filter preserved via qs)
if (this.isUsingV3()) {
    const options = {
        method: "GET",
        url: `${this.API_URL}/v3/resource`,
        headers: { Authorization: token, "Content-Type": "application/json" },
        qs: filter || {},
        json: true
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

### Events.js — Additional Note

`Events._getEventsV3` also uses raw `this.UAA_TOKEN.*` (C-05 pattern). Replace with `this.getAuthorizationHeader()` while we're in there. Same for `_getEventV3`.

---

## Phase 2 — W-02: Fix Input Filter Object Mutation (4 locations)

**Impact:** LOW-MEDIUM — Callers reusing filter objects get corrupted data on subsequent calls.
**Root Cause:** `let qs = filter || {};` assigns by reference, then mutates.
**Strategy:** Clone before mutating: `const qs = Object.assign({}, filter || {});`

### Files & Changes

| # | File | Method | Mutated Property | Fix |
|---|------|--------|-----------------|-----|
| 1 | `lib/model/cloudcontroller/Spaces.js` L340 | `_getAppsV3(guid, filter)` | `qs["space_guids"] = guid` | `const qs = Object.assign({}, filter \|\| {})` |
| 2 | `lib/model/cloudcontroller/Services.js` L149 | `_getServicePlansV3(guid, filter)` | `qs["service_offering_guids"] = guid` | Same |
| 3 | `lib/model/cloudcontroller/ServiceInstances.js` L367 | `_getServiceBindingsV3(guid, filter)` | `qs["service_instance_guids"] = guid` | Same |
| 4 | `lib/model/cloudcontroller/Organizations.js` L228-229 | `_getPrivateDomainsV3(guid, filter)` | `qs.visibility = "private"` | Same |

### Target Code

```javascript
// BEFORE (mutates caller's object)
let qs = filter || {};
qs["space_guids"] = guid;

// AFTER (safe clone)
const qs = Object.assign({}, filter || {});
qs["space_guids"] = guid;
```

---

## Phase 3 — W-07 + W-04: Fix Incorrect Endpoint Mappings

### W-07: ApiVersionManager.endpointMap — Wrong V3 Paths

**File:** `lib/config/ApiVersionManager.js` L28, L30

| Resource | Current V3 | Correct V3 | Reason |
|----------|-----------|------------|--------|
| `userProvidedServices` | `/v3/user_provided_service_instances` | `/v3/service_instances` | V3 unified UPS under service_instances with `type` filter |
| `jobs` | `/v3/jobs` | `/v3/jobs` ✅ (keep) BUT add `tasks` entry | Jobs.js actually uses `/v3/tasks` for task management |

**Fix:**
```javascript
// Change this:
userProvidedServices: { v2: "/v2/user_provided_service_instances", v3: "/v3/user_provided_service_instances" }

// To this:
userProvidedServices: { v2: "/v2/user_provided_service_instances", v3: "/v3/service_instances" },
tasks: { v2: null, v3: "/v3/tasks" }
```

### W-04: AppsDeployment.getInstances() v3 — Wrong Endpoint

**File:** `lib/model/cloudcontroller/AppsDeployment.js` L92

CF v3 has NO `/v3/apps/:guid/instances` endpoint. V3 approach is:
- `GET /v3/apps/:guid/processes` → list processes
- `GET /v3/processes/:processGuid/stats` → get instance stats

**Fix:** Change v3 branch to use `GET /v3/apps/:guid/processes` which returns process info including instances. The single `/instances` endpoint doesn't exist in v3.

```javascript
// BEFORE
const url = this.isUsingV3()
    ? `${this.API_URL}/v3/apps/${appGuid}/instances`  // Does NOT exist
    : `${this.API_URL}/v2/apps/${appGuid}/instances`;

// AFTER
const url = this.isUsingV3()
    ? `${this.API_URL}/v3/apps/${appGuid}/processes`  // List processes (closest v3 equivalent)
    : `${this.API_URL}/v2/apps/${appGuid}/instances`;
```

---

## Phase 4 — W-09 + W-06 + W-05 + W-08: Consistency & Guard Fixes

### W-09: Inconsistent Request Styles in Migrated V3 Code

**Files:** `ServicePlans.js`, `UserProvidedServices.js`

These files already work correctly (qs is passed via `this.REST.request()`). The inconsistency is that some methods use `requestV3()` (no qs) while others use `this.REST.request()` (with qs). This is a natural outcome of requestV3 not supporting qs.

**Decision:** NO CODE CHANGE needed for W-09. The mixed style is justified — methods needing qs use `this.REST.request()`, methods not needing qs use `requestV3()`. Document this as accepted technical debt.

Alternatively, if we want full consistency, we can switch ALL v3 methods to `this.REST.request()`. But this adds more boilerplate and contradicts KISS.

**Action:** Add a JSDoc comment at the class level explaining the pattern.

### W-06: Jobs.add() v2 — Incorrect Endpoint

**File:** `lib/model/cloudcontroller/Jobs.js` L82

```javascript
url: `${this.API_URL}/v2/apps/${appGuid}/tasks`  // v2 tasks endpoint doesn't exist
```

CF v2 has NO `/v2/apps/:guid/tasks`. Tasks are a v3-only concept. The `add()` method should throw for v2 or use the correct v2 jobs endpoint.

**Fix:** Add guard for v2 since tasks didn't exist in v2:
```javascript
add(appGuid, taskOptions) {
    if (!this.isUsingV3()) {
        throw new Error("Task creation is only supported in CF API v3. Use v3 mode.");
    }
    // ...existing v3 code...
}
```

### W-05: AppsDeployment.setEnvironmentVariables() v2 — Mixin Dependency

**File:** `lib/model/cloudcontroller/AppsDeployment.js` L203

```javascript
// v2 path — delegates to update() which comes from AppsCore via Apps facade
return this.update(appGuid, { environment_json: variables });
```

If used standalone, `this.update()` is undefined → runtime crash.

**Fix:** Add guard with descriptive error:
```javascript
if (typeof this.update !== "function") {
    throw new Error(
        "setEnvironmentVariables() v2 requires the Apps facade (mixin with AppsCore). " +
        "Use the Apps class instead, or switch to v3 mode."
    );
}
return this.update(appGuid, { environment_json: variables });
```

### W-08: ServiceInstances._removeV3() — Ignores acceptsIncomplete

**File:** `lib/model/cloudcontroller/ServiceInstances.js` L316

V3 always returns 202 for async deletion. The `acceptsIncomplete` flag is irrelevant in v3 (v3 always works asynchronously for service instance deletion).

**Fix:** Add JSDoc comment documenting this behavior. No code change needed — the current code is technically correct.

```javascript
/**
 * @private
 * V3 service instance deletion is always asynchronous (returns 202 with job URL).
 * The acceptsIncomplete parameter is accepted for API compatibility with the v2
 * code path but has no effect — v3 always behaves as if acceptsIncomplete=true.
 */
_removeV3(guid, deleteOptions, acceptsIncomplete) {
```

---

## Phase 5 — W-03: DRY Violation — Boilerplate Extraction (DEFERRED)

**Impact:** Maintenance burden, but no runtime bugs.
**Scope:** 100+ repetitions of request-options builder across all model files.
**Recommendation from review:** 1-2 sprints.

**Decision:** DEFER to separate plan (`plans/phase-04-dry-refactoring.md` already exists).
This is a large-scale refactor that:
- Touches every model file (22 files)
- Requires comprehensive test coverage first
- Should be planned as a dedicated refactoring sprint
- Low urgency — no bugs, just maintenance overhead

---

## TODO Checklist

### Phase 1 — W-01 Filter Fix (8 files)
- [ ] Fix `Domains.getDomains()` v3 branch
- [ ] Fix `Users.getUsers()` v3 branch
- [ ] Fix `Stacks.getStacks()` v3 branch
- [ ] Fix `BuildPacks.getBuildPacks()` v3 branch
- [ ] Fix `Jobs.getJobs()` v3 branch
- [ ] Fix `OrganizationsQuota.getOrganizationQuotas()` v3 branch
- [ ] Fix `SpacesQuota.getSpaceQuotas()` v3 branch
- [ ] Fix `Events._getEventsV3()` — also fix raw UAA_TOKEN access

### Phase 2 — W-02 Mutation Fix (4 files)
- [ ] Fix `Spaces._getAppsV3()` — clone filter
- [ ] Fix `Services._getServicePlansV3()` — clone filter
- [ ] Fix `ServiceInstances._getServiceBindingsV3()` — clone filter
- [ ] Fix `Organizations._getPrivateDomainsV3()` — clone filter

### Phase 3 — W-07 + W-04 Endpoint Fix
- [ ] Fix `ApiVersionManager.endpointMap` — userProvidedServices v3 path
- [ ] Add `tasks` entry to endpointMap
- [ ] Fix `AppsDeployment.getInstances()` — v3 endpoint

### Phase 4 — W-09 + W-06 + W-05 + W-08 Guards & Docs
- [ ] W-09: Add JSDoc explaining mixed request pattern in ServicePlans/UPS (no code change)
- [ ] W-06: Add v2 guard in `Jobs.add()` — throw for v2 since tasks are v3-only
- [ ] W-05: Add guard in `AppsDeployment.setEnvironmentVariables()` v2 path
- [ ] W-08: Add JSDoc to `ServiceInstances._removeV3()` explaining acceptsIncomplete behavior

### Phase 5 — W-03 DRY (DEFERRED)
- [ ] Defer to `plans/phase-04-dry-refactoring.md`

### Post-Fix
- [ ] Run `npm run test:unit` — verify all 93 tests still pass
- [ ] Run lint check if available

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Phase 1 changes break existing v3 calls | Use exact same pattern as ServicePlans.js (already tested & working) |
| Phase 2 clone might miss nested objects | Filter objects are flat key-value — shallow clone is sufficient |
| Phase 3 endpoint change breaks consumers | ApiVersionManager is not used by model classes (they hardcode URLs). Low risk. |
| Phase 4 guards throw unexpected errors | Only throws in misuse scenarios (standalone AppsDeployment, v2 tasks). Correct behavior. |

---

## Estimated Effort

| Phase | Files | Complexity | Time |
|-------|-------|-----------|------|
| Phase 1 | 8 | Low (mechanical) | ~20 min |
| Phase 2 | 4 | Low (one-liner) | ~5 min |
| Phase 3 | 2 | Low-Medium | ~10 min |
| Phase 4 | 4 | Low (guards + docs) | ~10 min |
| **Total** | **~15 files** | **Low** | **~45 min** |

---

*Plan created: 2025-07-15 | Based on Code-Review-250715.md*
