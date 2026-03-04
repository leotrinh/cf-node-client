# Community PRs Analysis & Adaptation Plan

**Repository:** prosociallearnEU/cf-nodejs-client (old, unmaintained)  
**Date:** 260304  
**Status:** 3 Open PRs found

---

## PR Summary Table

| PR # | Title | Author | Date | Status | Impact | Adapt? |
|------|-------|--------|------|--------|--------|--------|
| #195 | Fix updating apps | piotr-s-brainhub | Sep 2018 | Open | 🔴 CRITICAL | ✅ YES |
| #187 | Add support for ServiceKeys | hsiliev | Aug 2016 | Open | 🟡 FEATURE | ✅ YES |
| #193 | Link to documentation was wrong | WorkAlexGahr | Apr 2018 | Open | 🔵 TRIVIAL | ❌ SKIP |

---

## 1. PR #195: Fix Updating Apps ⚠️ CRITICAL

### What it fixes:
- **Issue:** When updating env vars with special characters (e.g., `!`, `@`, `#`), they get URL-encoded to `%21`, `%40`, `%23`
- **Root Cause:** Form-urlencoding escapes special characters
- **Solution:** Send raw JSON body instead of form encoding

### Code Change:
```javascript
// BEFORE: Form-encoded (causes escaping)
options.form = JSON.stringify(data);

// AFTER: Raw body (no escaping)
// Send as raw JSON with Content-Type: application/json
```

### Our Status:
✅ **ALREADY FIXED!** We just fixed this in Phase 1:
```javascript
// Our fix matches the community's approach
if (data && (method === "POST" || method === "PUT")) {
    options.form = data;  // Send object directly
}
```

### Adaptation Needed:
🟢 **NO CHANGES** - We implemented the same fix (+ more robust)

---

## 2. PR #187: Add Support for ServiceKeys 🎁 NEW FEATURE

### What it adds:
- **Feature:** ServiceKeys support for Cloud Foundry
- **Lines:** 258 additions (new file: lib/model/cloudcontroller/ServiceKeys.js)
- **API:** Get/create/delete service keys (CRUD operations)
- **Participants:** 2 (hsiliev author, zuhito requesting merge on Aug 2018)

### Why it matters:
ServiceKeys = credentials for accessing services programmatically (like connection strings)
- Get service key credentials for a service binding
- Used for microservices, CI/CD pipelines, etc.

### Implementation Pattern:
Expected same as our current models:
```javascript
class ServiceKeys extends CloudControllerBase {
    getServiceKeys(serviceInstanceGuid) { ... }
    getServiceKey(guid) { ... }
    add(serviceInstanceGuid, name) { ... }
    remove(guid) { ... }
}
```

### Our Adaptation:
✅ **NEEDED** - Create ServiceKeys model with v2/v3 support

**Endpoints:**
- v2: `/v2/service_keys`
- v3: `/v3/service_keys` (might be different, needs API check)

---

## 3. PR #193: Link to Documentation ✅ TRIVIAL

### What it fixes:
- **Issue:** JSDoc link in method pointing to wrong documentation
- **Change:** 1 line comment fix
- **Impact:** Documentation accuracy only

### Current Code:
```javascript
// @see {@link http://apidocs.cloudfoundry.org/delete-instance}
// Fixed to: @see {@link http://apidocs.cloudfoundry.org/create-instance}
```

### Our Adaptation:
❌ **SKIP** - We point to v3 API docs, not v2. Links will be updated as part of docs refresh.

---

## Adaptation Priority & Effort

| PR # | Priority | Effort | Target | Include? |
|------|----------|--------|--------|----------|
| #195 | 🔴 CRITICAL | ✅ DONE | Phase 1 | ✅ **DONE** |
| #187 | 🟡 HIGH | 2-3 days | Phase 9 (New) | ✅ **YES** |
| #193 | 🔵 LOW | 30 min | v2.0 | ❌ **SKIP** |

---

## Next Steps

### Phase 1: ✅ COMPLETE
- [x] HttpUtils.requestV2() form fix (matches PR #195 approach)
- [x] Token validation
- [x] Cleanup

### Phase 4: DRY Refactoring (as planned)
- Extract header builders
- Extract token getter
- Update 14 models

### Phase 9: NEW - ServiceKeys Support
- Create ServiceKeys.js model
- Implement v2/v3 dual endpoints
- Add to index.js exports
- Add tests
- Update CHANGELOG

---

## Community Impact
- ✅ Incorporated PR #195 fix (bug fix)
- ✅ Will implement PR #187 feature (enhancement)
- ⏭️ PR #193 can be considered for v2.0 docs refresh

**Total Community Value:** 2 major items (1 bugfix + 1 feature)

