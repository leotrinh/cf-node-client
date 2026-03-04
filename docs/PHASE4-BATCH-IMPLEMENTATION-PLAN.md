# Phase 4: Batch Implementation Plan - Remaining 8 Cloud Controller Models

## Current Status
✅ **Completed (6 models)**:
- Organizations.js (11 methods, v3-ready)
- Spaces.js (11 methods, v3-ready)
- Services.js (5 methods, v3-ready)
- ServiceInstances.js (8 methods, v3-ready)
- Routes.js (7 methods, v3-ready)
- ServiceBindings.js (5 methods, v3-ready)

**Total Lines Added**: ~2,500 lines of dual v2/v3 code
**Compilation Status**: ✅ All 6 models pass syntax check

📊 **Progress**: 43% → 57% (6/14 models complete)

---

## Remaining 8 Models (57% of Phase 4)

### Tier 2 Models (2 remaining)
**Priority: HIGH** | **Est. Time: 45 min**

#### 1. **Domains.js**
- Methods: getters, add, remove, private_domains (CRUD + shared)
- v2 Endpoint: /v2/domains
- v3 Endpoint: /v3/domains
- Key Changes: Shared domains v2 → visibility field in v3
- Lines: ~200
- Pattern: Standard CRUD + filtering

#### 2. **BuildPacks.js**  
- Methods: get, update, add (optional), position management
- v2 Endpoint: /v2/buildpacks
- v3 Endpoint: /v3/buildpacks
- Key Changes: Position as v3 dedicated field
- Lines: ~180
- Pattern: Standard CRUD + position handling

---

### Tier 3 Models (4 models)
**Priority: MEDIUM** | **Est. Time: 90 min**

#### 3. **Stacks.js**
- Methods: get, list (read-only, no mutators)
- v2 Endpoint: /v2/stacks
- v3 Endpoint: /v3/stacks
- Key Changes: READ-ONLY (no create/update/delete)
- Lines: ~100
- Pattern: Simple GET-only

#### 4. **Users.js**
- Methods: get, list, add, remove, members/managers/teams
- v2 Endpoint: /v2/users
- v3 Endpoint: /v3/users
- Key Changes: Role-based relationships (v3)
- Lines: ~250
- Pattern: Standard CRUD + relationship queries

#### 5. **Events.js**
- Methods: get, list (read-only)
- v2 Endpoint: /v2/events
- v3 Endpoint: /v3/audit_events
- Key Changes: Endpoint renamed, filtering important
- Lines: ~130
- Pattern: Simple GET-only + filtering

#### 6. **Jobs.js**
- Methods: get, list (read-only jobs/tasks)
- v2 Endpoint: /v2/jobs
- v3 Endpoint: /v3/jobs
- Key Changes: Job/task terminology alignment
- Lines: ~120
- Pattern: Simple GET-only + status queries

---

### Tier 4 Models (2 models)
**Priority: MEDIUM** | **Est. Time: 60 min**

#### 7. **OrganizationsQuota.js**
- Methods: get, list, add, update, remove
- v2 Endpoint: /v2/quota_definitions
- v3 Endpoint: /v3/organization_quotas
- Key Changes: Endpoint and field name changes
- Lines: ~200
- Pattern: Standard CRUD + quota resource fields

#### 8. **SpacesQuota.js**
- Methods: get, list, add, update, remove
- v2 Endpoint: /v2/space_quota_definitions
- v3 Endpoint: /v3/space_quotas
- Key Changes: Endpoint and field name changes
- Lines: ~200
- Pattern: Standard CRUD + quota resource fields

---

### Tier 5 Models (1 model - NOT in original 14, but needed)
**Priority: LOW** | **Est. Time: 30 min**

#### 9. **UserProvidedServices.js**
- Methods: get, list, add, update, remove (basic CRUD)
- v2 Endpoint: /v2/user_provided_service_instances
- v3 Endpoint: /v3/service_instances (type=user-provided)
- Key Changes: v3 uses service_instances with type filter
- Lines: ~150
- Pattern: Standard CRUD with v3 filtering

---

### Bonus: ServicePlans.js (mentioned in Services)
- Methods: get, list by service
- v2 Endpoint: /v2/service_plans
- v3 Endpoint: /v3/service_plans
- est. Lines: ~110
- Pattern: Simple CRUD

---

## Implementation Strategy

### Batch Approach (Recommended - Save tokens)
Instead of implementing all 8 individually, use the pattern template:

```javascript
/**
 * TEMPLATE: Copy-paste for each model
 */

// 1. Copy v2-only implementation
const v2Code = require("./Original-old-v2-backup.js");

// 2. Add dual v2/v3 methods following pattern:
method(param) {
    if (this.isUsingV3()) {
        return this._methodV3(param);
    } else {
        return this._methodV2(param);
    }
}

_methodV2(param) { /* v2 impl */ }
_methodV3(param) { /* v3 impl */ }
```

### Quick Reference: Endpoint Mappings

```
v2 → v3 Mappings:
/v2/domains → /v3/domains
/v2/buildpacks → /v3/buildpacks  
/v2/stacks → /v3/stacks
/v2/users → /v3/users
/v2/events → /v3/audit_events ⚠️ RENAMED
/v2/jobs → /v3/jobs
/v2/quota_definitions → /v3/organization_quotas ⚠️ RENAMED
/v2/space_quota_definitions → /v3/space_quotas ⚠️ RENAMED
/v2/user_provided_service_instances → /v3/service_instances (type filter)
/v2/service_plans → /v3/service_plans
```

---

## Execution Plan

### Option A: Sequential (Safe, 4 hours total)
1. Domains → BuildPacks (45 min) - Tier 2
2. Stacks → Users → Events → Jobs (90 min) - Tier 3
3. OrganizationsQuota → SpacesQuota (60 min) - Tier 4
4. UserProvidedServices (30 min) - Tier 5
5. Test all 8 + integration tests (1.5 hour)

### Option B: Accelerated Batch (Fast, 2.5 hours)
1. Generate all 8 using template script (1 hour)
2. Fix endpoint mappings for renamed endpoints (30 min)
3. Run compilation + basic tests (1 hour)

---

## Completion Metrics

**After Phase 4 Complete:**
- Total Models with v3: 14/14 (100%)
- Total Dual-Support Methods: 120+ methods
- Code Size: ~6,000 lines of production code
- Breaking Changes: 0 (full backward compatibility)
- New Features: v3-only methods accessible

---

## Next Phases (After Phase 4)

**Phase 5**: Verify Metrics & UAA models (30 min)
- Check Logs.js & UsersUAA.js for v3 compat

**Phase 6**: Comprehensive Tests (1.5-2 hours)
- Unit tests for all 14 models
- Version switching tests
- Integration tests with actual CF instance

**Phase 7**: Release Preparation (1 hour)
- Update README with v3 examples
- Create migration guide
- Bump version → 1.0.0

**Phase 8**: COMPLETED ✅
- Package name: cf-nodejs-client → cf-node-client
- Updated in package.json, README, CHANGELOG

---

## Success Criteria for Phase 4

- [ ] All 14 models support dual v2/v3 API
- [ ] All models pass syntax check (`node -c`)
- [ ] All models import/export correctly
- [ ] ApiVersionManager has all 14 endpoint mappings
- [ ] No breaking changes to v2 code paths
- [ ] Commit ready with comprehensive message
- [ ] Documentation updated with model completion status

---

## Recommended Action

**Proceed with**: Option B (Accelerated Batch)
- Fast completion (2.5 hours)
- Uses proven template pattern
- Reduces token consumption  
- All models ready for testing

**Timeline**: Can complete Phase 4-8 within 6-7 hours total
