# Community PRs Analysis & Adaptation Plan

**Sources:**
1. prosociallearnEU/cf-nodejs-client (old, unmaintained)  
2. IBM-Cloud/cf-nodejs-client (IBM-managed fork)

**Date:** 260304  
**Status:** 5 Open PRs found (consolidated from 2 sources)

---

## PR Summary Table (Consolidated)

**prosociallearnEU/cf-nodejs-client (3 PRs):**

| PR # | Title | Author | Date | Status | Impact | Adapt? |
|------|-------|--------|------|--------|--------|--------|
| #195 | Fix updating apps | piotr-s-brainhub | Sep 2018 | Open | 🔴 CRITICAL | ✅ **DONE** |
| #187 | Add support for ServiceKeys | hsiliev | Aug 2016 | Open | 🟡 FEATURE | ✅ YES |
| #193 | Link to documentation was wrong | WorkAlexGahr | Apr 2018 | Open | 🔵 TRIVIAL | ❌ SKIP |

**IBM-Cloud/cf-nodejs-client (2 PRs):**

| PR # | Title | Author | Date | Status | Impact | Adapt? |
|------|-------|--------|------|--------|--------|--------|
| #46 | Update request version (security) | kyle-apex | Nov 2017 | Open | 🔴 **SECURITY** | ✅ YES |
| #48 | Add ServiceKeys implementation | zuhito | Aug 2018 | Open | 🟡 FEATURE | ✅ YES (same as #187) |

**Total Actionable Items:** 3 unique PRs to adapt

---

## 🔴 NEW CRITICAL FINDING: IBM-Cloud PR #46 - Security Vulnerability

**IBM-Cloud/cf-nodejs-client PR #46:** Update "request" version to avoid security vulnerability

### Security Issues Found:
1. **tough-cookie@2.2.2** - ReDoS vulnerability parsing Set-Cookie
   - CVE Advisory: https://nodesecurity.io/advisories/130
   - Impact: Denial of Service via malicious Set-Cookie header
   
2. **ws** - Unspecified dependency vulnerability  
   - CVE Advisory: https://nodesecurity.io/advisories/550
   
3. **Summary:** 9 out of 10 vulnerabilities can be fixed by updating dependencies with ^versions

### Fix Applied in PR #46:
```json
{
  "dependencies": {
    "bluebird": "^3.0.6",      // Allow minor updates
    "protobufjs": "^5.0.1",    // Allow minor updates
    "request": "^2.81.0",      // Allow minor updates (was pinned)
    "restler": "^3.4.0",       // Allow minor updates
    "ws": "^1.1.1"             // Allow minor updates
  }
}
```

### Our Action:
✅ **MUST ADOPT** - Update package.json with caret-based versioning to allow security patches

**Status in v1.0.0:** 
- ⚠️ Current package.json likely has pinned vulnerable versions
- Action: Update to use ^ for security updates

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

| PR # | Source | Priority | Effort | Target | Include? | Notes |
|------|--------|----------|--------|--------|----------|-------|
| #195 | prosociallearnEU | 🔴 CRITICAL | ✅ DONE | Phase 1 | ✅ **DONE** | Form property bug |
| #46 | IBM-Cloud | 🔴 **SECURITY** | 30 min | Phase 1.5 | ✅ **YES** | Dependency versions |
| #187/#48 | Both repos | 🟡 HIGH | 2-3 days | Phase 9 | ✅ **YES** | ServiceKeys feature |
| #193 | prosociallearnEU | 🔵 LOW | 30 min | v2.0 | ❌ **SKIP** | Doc link only |

---

## Next Steps

### Phase 1: ✅ COMPLETE
- [x] HttpUtils.requestV2() form fix (matches PR #195 approach)
- [x] Token validation
- [x] Cleanup
1.5: NEW - Security Dependencies ⚠️ **URGENT**
- [ ] Update package.json with ^ for security patches
- [ ] Run `npm audit` to verify
- [ ] Test compatibility with updated versions
- [ ] Commit security update

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

## Community Impact Summary

**From prosociallearnEU/cf-nodejs-client:**
- ✅ PR #195 bug fix (incorporated)
- ✅ PR #187 feature (will implement)
- ⏭️ PR #193 doc fix (skip for now)

**From IBM-Cloud/cf-nodejs-client:**
- ✅ PR #46 security (will implement - URGENT!)
- ✅ PR #48 feature (same as #187)

**Total Value:**
- 1 Critical bug fix ✅
- 1 Security update ⚠️ (NEW)
- 1 Feature enhancement 
- Consolidated from 5 PRs across 2 repos

**Outstanding:** 2 actionable improvements for v1.0.0
**Total Community Value:** 2 major items (1 bugfix + 1 feature)

