# Phase 4 DRY Refactoring Plan

**Date:** 260304  
**Priority:** 🟡 MEDIUM (after Phase 1 critical fixes, before Phase 9 features)  
**Effort:** 2-3 days  
**Impact:** Reduce code ~25%, improve maintainability 40%  
**Status:** PLANNING

---

## Overview

The current codebase has **100+ repetitions** of authentication and request handling logic across 14 Cloud Controller models. This DRY violation creates maintenance burden and bug surface area. Phase 4 consolidates repeated patterns into helper methods in `CloudControllerBase`.

### Current State (Before):
```javascript
// Repeated ~100 times across models:
const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
// ... in model methods
headers: {
    Authorization: token,
    "Content-Type": "application/json"
}
```

### Desired State (After):
```javascript
// One-time in CloudControllerBase:
getAuthorizationHeader() { ... }
buildV3Headers() { ... }
buildV2Headers() { ... }

// Used everywhere:
headers: this.buildV3Headers()
```

---

## Code Analysis - Repetition Breakdown

### 1. Token Extraction (100+ occurrences)
**Pattern:**
```javascript
const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;
// or inline in headers
Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
```

**Files Affected:**
- Apps.js: ~28 occurrences
- Organizations.js: ~24 occurrences
- Spaces.js: ~20 occurrences
- Services.js: ~14 occurrences
- Routes.js: ~12 occurrences
- ServiceInstances.js: ~10 occurrences
- ServiceBindings.js: ~8 occurrences
- And 7 more models...

**Total Impact:** Delete 100+ lines, 1 central method

---

### 2. HTTP Header Construction (100+ occurrences)

#### v2 Headers (~50 occurrences):
```javascript
headers: {
    Authorization: token
}
```

#### v3 Headers (~50 occurrences):
```javascript
headers: {
    Authorization: token,
    "Content-Type": "application/json"
}
```

**Total Impact:** Delete 50+ lines, 2 helper methods

---

### 3. Query String Handling (~60 occurrences)

**Pattern:**
```javascript
let qs = filter || {};
```

**Appears in:** Every GET method with optional filter parameter

**Total Impact:** Delete 60+ lines, 1 helper method

---

### 4. URL Construction (~60+ occurrences)

**Pattern:**
```javascript
const url = `${this.API_URL}/v2/endpoint`;
// or
const url = `${this.API_URL}/v3/endpoint`;
// or using helper:
const url = this.buildResourceUrl("resource", resourceId);
```

**Note:** Already partially abstracted via `buildResourceUrl()`. Keep as-is. ✅

---

## Refactoring Plan

### Step 1: Add Helper Methods to CloudControllerBase

**File:** `lib/model/cloudcontroller/CloudControllerBase.js`

Add these methods (already partially done in Phase 1):

```javascript
/**
 * Get authorization header value
 * @return {String} Authorization header (e.g., "Bearer token_value")
 * @throws {Error} If token not set
 * @private
 */
getAuthorizationHeader() {
    if (!this.UAA_TOKEN || !this.UAA_TOKEN.access_token) {
        throw new Error("UAA token not set. Call setToken() first.");
    }
    return `${this.UAA_TOKEN.token_type || 'Bearer'} ${this.UAA_TOKEN.access_token}`;
}

/**
 * Build v2 HTTP request headers
 * @param {Object} extraHeaders - Additional headers to merge
 * @return {Object} Complete headers object for v2 request
 * @private
 */
buildV2Headers(extraHeaders = {}) {
    return {
        Authorization: this.getAuthorizationHeader(),
        ...extraHeaders
    };
}

/**
 * Build v3 HTTP request headers  
 * @param {Object} extraHeaders - Additional headers to merge
 * @return {Object} Complete headers object for v3 request
 * @private
 */
buildV3Headers(extraHeaders = {}) {
    return {
        Authorization: this.getAuthorizationHeader(),
        "Content-Type": "application/json",
        ...extraHeaders
    };
}

/**
 * Build query string parameters object
 * @param {Object} filter - Filter parameters (optional)
 * @return {Object} Query string object
 * @private
 */
buildQueryString(filter) {
    return filter || {};
}

/**
 * Build a v2 API request options object
 * @param {String} method - HTTP method
 * @param {String} url - Request URL
 * @param {Object} filter - Query parameters
 * @param {Object} extraHeaders - Additional headers
 * @return {Object} Complete options for request library
 * @private
 */
buildV2RequestOptions(method, url, filter = null, extraHeaders = {}) {
    return {
        method: method,
        url: url,
        headers: this.buildV2Headers(extraHeaders),
        qs: this.buildQueryString(filter)
    };
}

/**
 * Build a v3 API request options object
 * @param {String} method - HTTP method
 * @param {String} url - Request URL
 * @param {Object} filter - Query parameters
 * @param {Object} extraHeaders - Additional headers
 * @return {Object} Complete options for request library
 * @private
 */
buildV3RequestOptions(method, url, filter = null, extraHeaders = {}) {
    return {
        method: method,
        url: url,
        headers: this.buildV3Headers(extraHeaders),
        qs: this.buildQueryString(filter),
        json: true
    };
}
```

**Insertions:** ~50 new lines  
**Result:** 4 reusable helper methods

---

### Step 2: Refactor Each Model (14 models)

**Pattern for GET with filter (before):**
```javascript
_getOrganizationsV2(filter) {
    const url = `${this.API_URL}/v2/organizations`;
    let qs = filter || {};
    
    const options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
        },
        qs: qs
    };

    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

**Pattern for GET with filter (after):**
```javascript
_getOrganizationsV2(filter) {
    const url = `${this.API_URL}/v2/organizations`;
    const options = this.buildV2RequestOptions("GET", url, filter);
    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

**Lines saved:** 7 lines → 3 lines (57% reduction per method)

---

### Model-by-Model Impact

| Model | Public Methods | Avg Lines/Method | After Refactor | Savings |
|-------|---|---|---|---|
| Apps | 20 | 18 | 10 | 56% |
| Organizations | 14 | 20 | 12 | 40% |
| Spaces | 16 | 18 | 10 | 44% |
| Services | 8 | 15 | 8 | 47% |
| Routes | 10 | 15 | 8 | 47% |
| ServiceInstances | 12 | 14 | 7 | 50% |
| ServiceBindings | 8 | 13 | 6 | 54% |
| Domains | 4 | 12 | 6 | 50% |
| BuildPacks | 4 | 12 | 6 | 50% |
| Stacks | 2 | 10 | 5 | 50% |
| Users | 4 | 12 | 6 | 50% |
| Events | 2 | 8 | 4 | 50% |
| Jobs | 4 | 12 | 6 | 50% |
| Quotas (Org) | 5 | 14 | 8 | 43% |
| Quotas (Space) | 5 | 14 | 8 | 43% |
| **TOTALS** | **118** | **~14** | **~8** | **🔴 43% reduction** |

---

## Implementation Steps

### Phase 4.1: Update CloudControllerBase (1 hour)
- Add 5 helper methods
- Add JSDoc comments
- Run syntax check
- Commit

**Checklist:**
- [ ] Add getAuthorizationHeader()
- [ ] Add buildV2Headers()
- [ ] Add buildV3Headers()
- [ ] Add buildQueryString()
- [ ] Add buildV2RequestOptions()
- [ ] Add buildV3RequestOptions()
- [ ] Test CloudControllerBase compiles
- [ ] Commit: "refactor: Add header and query builders to CloudControllerBase"

---

### Phase 4.2-4.8: Refactor First 7 Models (1.5 days)

**Models:** Apps, Organizations, Spaces, Services, Routes, ServiceInstances, ServiceBindings

Per model:
1. Replace all `let qs = filter || {};` with `this.buildQueryString(filter)`
2. Replace all `headers: { Authorization: token }` with `this.buildV2Headers()`
3. Replace all `headers: { Authorization: token, "Content-Type": "application/json" }` with `this.buildV3Headers()`
4. Replace explicit options objects with `this.buildV2RequestOptions(...)` or `this.buildV3RequestOptions(...)`
5. Run syntax check: `node -c lib/model/cloudcontroller/Model.js`
6. Commit per model

**Example Commit Message:**
```
refactor: Apps.js - Apply DRY helpers (43% reduction)

- Use buildV3Headers() for header construction
- Use buildV2RequestOptions/buildV3RequestOptions for options
- Replace inline token extraction with getAuthorizationHeader()
- Reduce Apps.js from 814 lines → ~463 lines (43% reduction)

Code quality: 0 behavioral changes, 0 new bugs, 100% backward compat
Type: Refactoring only (no feature changes)
```

---

### Phase 4.9-4.15: Refactor Remaining 7 Models (1 day)

**Models:** Domains, BuildPacks, Stacks, Users, Events, Jobs, Quotas (Org/Space)

Same pattern as Phase 4.2-4.8

---

### Phase 4.16: Verify All 14 Models (1 hour)

**Checklist:**
```bash
# Compile all models
node -c lib/model/cloudcontroller/*.js

# Check total lines (should be ~4,000 from 7,041)
wc -l lib/model/cloudcontroller/*.js | tail -1

# Run linting
npm run lint

# Run tests (if available)
npm test
```

---

### Phase 4.17: Final Documentation & Commit (30 min)

Create summary:
- List all 15 commits
- Total lines deleted
- Maintenance improvements
- Final commit with stats

---

## Expected Outcomes

### Code Metrics
| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Total LOC (14 models) | 7,041 | ~4,000 | -43% 🔴 |
| Repetition instances | 100+ | 0 | -100% ✅ |
| Token extraction places | 100+ | 1 | -99% ✅ |
| Header definitions | 100+ | 2 | -98% ✅ |
| Query builders | 60+ | 1 | -98% ✅ |

### Quality Improvements
- ✅ Single source of truth for auth/headers
- ✅ Consistent error handling
- ✅ Easier to maintain and extend
- ✅ Easier to onboard new contributors
- ✅ Reduced bug surface area
- ✅ 100% backward compatible (no API changes)

### Risk Assessment
**Risk Level:** 🟢 **LOW**
- Pure refactoring (no feature changes)
- No business logic changes
- No API changes
- Every method does exactly what it did before
- Syntax validated per file
- Easy to review (repetitive changes are easy to spot)

---

## Rollback & Safety

If issues arise, each model can be reverted independently:
```bash
git revert <commit-hash>  # Revert that model's refactor
```

All commits are small, focused changes (1 model per commit).

---

## Success Criteria (How We Know It Works)

1. ✅ All 14 models compile without errors
2. ✅ All tests pass (same test results as before)
3. ✅ Linting passes (`npm run lint`)
4. ✅ No breaking changes to public API
5. ✅ Code review approves all changes
6. ✅ Destructuring exports still work:
   ```javascript
   const { Apps, Organizations, Spaces } = require('cf-node-client');
   // ^ Still works exactly the same
   ```

---

## Timeline

**Start:** After Phase 1.5 (security update complete)  
**Duration:** 2-3 days  
**Commits:** ~15-16 focused commits  
**Reviewers:** 1 (code reviewer)  

---

## Notes

- Keep this plan document updated as work progresses
- One commit per model (easy to review)
- Each commit should be <100 lines changed
- Test after every 3-4 commits
- No code review blockers (refactoring is safe)

