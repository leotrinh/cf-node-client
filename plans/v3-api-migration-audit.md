# V3 API Migration Audit — CloudController Classes

**Date:** 2026-03-05
**Status:** Planning
**Priority:** High

---

## Audit Summary

Reviewed all 21 files in `lib/model/cloudcontroller/`. Categorized by v3 support status.

### Legend
- **FULL** = All methods support both v2 and v3 (or v3-only where appropriate)
- **PARTIAL** = Some methods v2-only, others migrated
- **NONE** = Entire class is v2-only, zero v3 support
- **N/A** = Facade/base, no direct API calls

---

## Results

| # | Class | File | V3 Status | V2-Only Methods | Notes |
|---|-------|------|-----------|-----------------|-------|
| 1 | CloudControllerBase | CloudControllerBase.js | N/A | — | Base class, provides `isUsingV3()`, `buildResourceUrl()`, etc. |
| 2 | Apps | Apps.js | N/A | — | Facade: mixes AppsCore + AppsDeployment + AppsCopy |
| 3 | AppsCore | AppsCore.js | **FULL** | — | All methods (getApps, getApp, getAppByName, add, update, stop, start, restart, getSummary, remove, getAllApps) support v2+v3 |
| 4 | AppsDeployment | AppsDeployment.js | **FULL** | `restage` (v2-only, throws on v3) | `getDroplets`, `getPackages`, `getProcesses` are v3-only. All others dual. |
| 5 | AppsCopy | AppsCopy.js | **FULL** | `copyBits` (v2-only, throws on v3) | `copyPackage`, `downloadDroplet` are v3-only. `downloadBits` is dual. |
| 6 | BuildPacks | BuildPacks.js | **FULL** | — | All methods dual v2/v3 |
| 7 | Domains | Domains.js | **FULL** | — | All methods dual v2/v3 |
| 8 | Events | Events.js | **FULL** | — | v3 uses `/v3/audit_events`. All methods dual. |
| 9 | Jobs | Jobs.js | **FULL** | — | v3 uses `/v3/tasks`. All methods dual. |
| 10 | Organizations | Organizations.js | **FULL** | `getMemoryUsage` (v2-only, throws on v3) | All other methods dual v2/v3 |
| 11 | OrganizationsQuota | OrganizationsQuota.js | **FULL** | — | All methods dual v2/v3. Has `_translateToV3` helper. |
| 12 | Routes | Routes.js | **FULL** | — | All methods dual v2/v3 |
| 13 | ServiceBindings | ServiceBindings.js | **FULL** | — | v3 uses `service_credential_bindings`. All methods dual. |
| 14 | ServiceInstances | ServiceInstances.js | **FULL** | `getInstancePermissions` (v2-only, throws on v3) | `startInstance`, `stopInstance` are v3-only. All others dual. |
| 15 | Services | Services.js | **FULL** | `enableServiceForOrganization`, `disableServiceForOrganization` (v2-only, throw on v3) | v3 uses `service_offerings`. Core methods dual. |
| 16 | Spaces | Spaces.js | **FULL** | — | All methods dual v2/v3. Includes getApps, getUsers, getManagers, getDevelopers, getAuditors. |
| 17 | SpacesQuota | SpacesQuota.js | **FULL** | — | All methods dual v2/v3. Has `_translateToV3` helper. |
| 18 | Stacks | Stacks.js | **FULL** | — | All methods dual v2/v3 (read-only: getStacks, getStack) |
| 19 | Users | Users.js | **FULL** | — | All methods dual v2/v3 |
| 20 | **CloudController** | **CloudController.js** | **NONE** | `getInfo`, `getFeaturedFlags`, `getFeaturedFlag`, `setFeaturedFlag` | **Constructor doesn't accept options. All URLs hardcoded to /v2/.** |
| 21 | **ServicePlans** | **ServicePlans.js** | **NONE** | `getServicePlans`, `getServicePlan`, `getServicePlanInstances`, `remove` | **Constructor doesn't accept options. All URLs hardcoded to /v2/.** |
| 22 | **UserProvidedServices** | **UserProvidedServices.js** | **NONE** | `getServices`, `getService`, `add`, `remove`, `getServiceBindings` | **Constructor doesn't accept options. All URLs hardcoded to /v2/.** |

---

## Classes Requiring Migration (v2-only)

### 1. CloudController.js — **CRITICAL**
**Current:** 4 methods, all hardcoded `/v2/`
**Constructor:** `constructor(endPoint)` — no `options` param, doesn't pass to `super()`

**Methods to migrate:**

| Method | V2 Endpoint | V3 Equivalent | Notes |
|--------|-------------|---------------|-------|
| `getInfo()` | `/v2/info` | `/v3/info` or `/` (root) | v3 info endpoint is at root `/` or `/v3/info` depending on CF version |
| `getFeaturedFlags()` | `/v2/config/feature_flags` | `/v3/feature_flags` | Renamed in v3 |
| `getFeaturedFlag(flag)` | `/v2/config/feature_flags/{flag}` | `/v3/feature_flags/{flag}` | Path simplified |
| `setFeaturedFlag(flag)` | `/v2/config/feature_flags/{flag}` (PUT) | `/v3/feature_flags/{flag}` (PATCH) | Method changed PUT→PATCH, body required in v3 |

**Effort:** Low-Medium

---

### 2. ServicePlans.js — **HIGH PRIORITY**
**Current:** 4 methods, all hardcoded `/v2/`
**Constructor:** `constructor(endPoint)` — no `options` param

**Methods to migrate:**

| Method | V2 Endpoint | V3 Equivalent | Notes |
|--------|-------------|---------------|-------|
| `getServicePlans(filter)` | `/v2/service_plans` | `/v3/service_plans` | Same resource name in v3 |
| `getServicePlan(guid)` | `/v2/service_plans/{guid}` | `/v3/service_plans/{guid}` | Same |
| `getServicePlanInstances(guid)` | `/v2/service_plans/{guid}/service_instances` | `/v3/service_instances?service_plan_guids={guid}` | v3 uses query param filter |
| `remove(guid)` | `/v2/service_plans/{guid}` (DELETE) | `/v3/service_plans/{guid}` (DELETE) | Same |

**Effort:** Low

---

### 3. UserProvidedServices.js — **HIGH PRIORITY**
**Current:** 5 methods, all hardcoded `/v2/`
**Constructor:** `constructor(endPoint)` — no `options` param

**Methods to migrate:**

| Method | V2 Endpoint | V3 Equivalent | Notes |
|--------|-------------|---------------|-------|
| `getServices()` | `/v2/user_provided_service_instances` | `/v3/service_instances?type=user-provided` | v3 merges UPS into service_instances |
| `getService(guid)` | `/v2/user_provided_service_instances/{guid}` | `/v3/service_instances/{guid}` | Same endpoint, filtered by type |
| `add(upsOptions)` | `/v2/user_provided_service_instances` (POST) | `/v3/service_instances` (POST) | Body must include `type: "user-provided"` |
| `remove(guid)` | `/v2/user_provided_service_instances/{guid}` (DELETE) | `/v3/service_instances/{guid}` (DELETE) | Same |
| `getServiceBindings(guid, filter)` | `/v2/user_provided_service_instances/{guid}/service_bindings` | `/v3/service_credential_bindings?service_instance_guids={guid}` | Uses query param filter in v3 |

**Effort:** Medium (v3 merges UPS into general service_instances, needs careful body translation)

---

## Implementation Plan

### Phase 1: Constructor Alignment (all 3 classes)
- [ ] Update constructors to accept `options = {}` parameter
- [ ] Pass `options` to `super(endPoint, options)`
- [ ] This enables `isUsingV3()`, `getAuthorizationHeader()`, etc.

### Phase 2: CloudController.js Migration
- [ ] Add `_getInfoV3()` — use `/v3/info` or root endpoint
- [ ] Add `_getFeaturedFlagsV3()` — use `/v3/feature_flags`
- [ ] Add `_getFeaturedFlagV3(flag)` — use `/v3/feature_flags/{flag}`
- [ ] Add `_setFeaturedFlagV3(flag)` — use PATCH `/v3/feature_flags/{flag}` with body
- [ ] Add v2/v3 routing via `isUsingV3()` in each public method
- [ ] Replace direct `this.UAA_TOKEN` usage with `this.getAuthorizationHeader()`

### Phase 3: ServicePlans.js Migration
- [ ] Add `_getServicePlansV3(filter)` — use `/v3/service_plans`
- [ ] Add `_getServicePlanV3(guid)` — use `/v3/service_plans/{guid}`
- [ ] Add `_getServicePlanInstancesV3(guid)` — use `/v3/service_instances?service_plan_guids={guid}`
- [ ] Add `_removeV3(guid)` — use DELETE `/v3/service_plans/{guid}`
- [ ] Add v2/v3 routing via `isUsingV3()` in each public method

### Phase 4: UserProvidedServices.js Migration
- [ ] Add `_getServicesV3()` — use `/v3/service_instances?type=user-provided`
- [ ] Add `_getServiceV3(guid)` — use `/v3/service_instances/{guid}`
- [ ] Add `_addV3(upsOptions)` — use POST `/v3/service_instances` with `type: "user-provided"`
- [ ] Add `_removeV3(guid)` — use DELETE `/v3/service_instances/{guid}`
- [ ] Add `_getServiceBindingsV3(guid, filter)` — use `/v3/service_credential_bindings?service_instance_guids={guid}`
- [ ] Add v2/v3 routing via `isUsingV3()` in each public method

### Phase 5: Testing
- [ ] Add/update unit tests for each class (v2 mode + v3 mode)
- [ ] Verify backward compatibility (default v3, opt-in v2)
- [ ] Run full test suite

### Phase 6: Documentation
- [ ] Update JSDoc for migrated methods
- [ ] Update TypeScript type definitions in `types/index.d.ts`

---

## V2-Only Methods in Migrated Classes (Intentional)

These methods are v2-only by design (no v3 equivalent exists). They correctly throw on v3:

| Class | Method | Reason |
|-------|--------|--------|
| AppsDeployment | `restage()` | v3 uses package/droplet endpoints instead |
| AppsCopy | `copyBits()` | v3 uses `copyPackage()` instead |
| Organizations | `getMemoryUsage()` | No v3 equivalent |
| ServiceInstances | `getInstancePermissions()` | No v3 equivalent |
| Services | `enableServiceForOrganization()` | v3 uses service plan visibility |
| Services | `disableServiceForOrganization()` | v3 uses service plan visibility |

These are acceptable and don't need migration.

---

## Risk Assessment
- **Low risk**: ServicePlans — straightforward 1:1 endpoint mapping
- **Low risk**: CloudController — simple endpoints, well-documented v3 API
- **Medium risk**: UserProvidedServices — v3 merges UPS into service_instances, need body translation
- **Backward compat**: All changes are additive; v2 paths remain unchanged
