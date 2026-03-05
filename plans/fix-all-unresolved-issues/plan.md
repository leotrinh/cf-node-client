# Fix Plan — All Unresolved Upstream Issues

> **Created:** 2025-01-XX  
> **Completed:** 2025-07-XX  
> **Total Issues:** 16 fixed across 2 upstream repos  
> **Phases:** 4 (Critical → High → Medium → Low) — **ALL COMPLETE**

---

## Status Overview

| Phase | Priority | Issues | Status |
|-------|----------|--------|--------|
| [Phase 1](phase-01-critical-security.md) | Critical — Security & Deps | 2 | ✅ Complete |
| [Phase 2](phase-02-high-bug-fixes.md) | High — Runtime Bugs | 3 | ✅ Complete |
| [Phase 3](phase-03-medium-features.md) | Medium — Missing Features | 6 | ✅ Complete |
| [Phase 4](phase-04-low-enhancements.md) | Low — Enhancements | 5 | ✅ Complete |

---

## Issue → Phase Mapping

| # | Repo | Issue | Phase | Files Affected | Status |
|---|------|-------|-------|----------------|--------|
| 1 | prosocial#198 | Apps.upload() broken (restler) | Phase 1 | `lib/utils/HttpUtils.js`, `package.json` | ✅ Fixed |
| 2 | ibm#50 | Node security alerts (request, ws) | Phase 1 | `lib/utils/HttpUtils.js`, `package.json` | ✅ Fixed |
| 3 | ibm#52 | protobufjs vulnerability | Phase 1 | `package.json`, `lib/model/metrics/Logs.js` | ✅ Fixed |
| 4 | ibm#45 | Events/Logs TypeError | Phase 2 | `lib/model/cloudcontroller/Events.js` | ✅ Fixed |
| 5 | prosocial#192 | Async service creation missing | Phase 2 | `lib/model/cloudcontroller/ServiceInstances.js` | ✅ Fixed |
| 6 | ibm#47 | Same-name services in spaces | Phase 2 | `lib/model/cloudcontroller/ServiceInstances.js` | ✅ Fixed |
| 7 | prosocial#156 | URL validation missing | Phase 3 | `lib/model/cloudcontroller/CloudControllerBase.js` | ✅ Fixed |
| 8 | ibm#44 | APIKey / client_credentials auth | Phase 3 | `lib/model/uaa/UsersUAA.js` | ✅ Fixed |
| 9 | ibm#15 | getTokenInfo() missing | Phase 3 | `lib/model/uaa/UsersUAA.js` | ✅ Fixed |
| 10 | prosocial#199 | HANA Cloud start/stop | Phase 3 | `lib/model/cloudcontroller/ServiceInstances.js` | ✅ Fixed |
| 11 | prosocial#183 | Log timestamp missing | Phase 3 | `lib/model/metrics/Logs.js` | ✅ Fixed |
| 12 | prosocial#173 | .cfignore support | Phase 3 | `lib/model/cloudcontroller/Apps.js` | ✅ Fixed |
| 13 | prosocial#196 | Copy bits between apps | Phase 4 | `lib/model/cloudcontroller/Apps.js` | ✅ Fixed |
| 14 | prosocial#161 | Improve JSDocs / TS types | Phase 4 | All `lib/**/*.js`, `types/index.d.ts` | ✅ Fixed |
| 15 | prosocial#158 | Download droplet | Phase 4 | `lib/model/cloudcontroller/Apps.js` | ✅ Fixed |
| 16 | prosocial#157 | Download bits | Phase 4 | `lib/model/cloudcontroller/Apps.js` | ✅ Fixed |

---

## Dependencies Between Phases

```
Phase 1 (Security/Deps) ──► Phase 2 (Bug Fixes)
         │                          │
         │  restler removal         │  Events.js fix
         │  unlocks upload fix      │  unlocks all model tests
         ▼                          ▼
Phase 3 (Features) ────────► Phase 4 (Enhancements)
         │                          │
         │  URL validation          │  copy/download bits
         │  auth methods            │  depend on HttpUtils
         │  .cfignore               │  changes from Phase 1
         ▼                          ▼
                    Done
```

> **Phase 1 MUST complete first** — replacing `restler` and `request` changes the HTTP layer used by every other phase.

---

## Quick Reference — Resolved Issues (5)

Already fixed in codebase, no action needed:

- ✅ prosocial#191 — `setEnvironmentVariables()` exists in Apps.js
- ✅ prosocial#190 — Any CF env support documented
- ✅ prosocial#188 — Travis removed, GitHub Actions ready
- ✅ prosocial#179 — `createApp()` exists in Apps.js
- ✅ ibm#43 — Duplicate of prosocial#190

---

## Completion Summary

**All 16 issues resolved. 47 unit tests passing. TypeScript clean.**

### What Changed

| File | Change |
|------|--------|
| `lib/utils/HttpUtils.js` | REWRITTEN — `node-fetch` + `form-data` replace `request`/`restler`/`bluebird` |
| `lib/utils/HttpStatus.js` | Added `ACCEPTED = 202` for async operations |
| `lib/utils/CfIgnoreHelper.js` | NEW — `.cfignore` parser with glob patterns |
| `lib/model/cloudcontroller/CloudControllerBase.js` | Added `isValidEndpoint()` URL validation |
| `lib/model/cloudcontroller/Events.js` | REWRITTEN — ES6 class, fixed property references |
| `lib/model/cloudcontroller/ServiceInstances.js` | Added 7 new methods + `acceptsIncomplete` param |
| `lib/model/cloudcontroller/Apps.js` | Replaced restler, added copy/download methods |
| `lib/model/uaa/UsersUAA.js` | URL validation + 5 new auth/token methods |
| `lib/model/metrics/Logs.js` | URL validation + `getRecentParsed()` + `parseLogs()` |
| `package.json` | Removed bluebird/request/restler, added node-fetch/form-data, upgraded protobufjs v7 + ws v8 |
| `types/index.d.ts` | All new methods/classes declared |

### Dependencies Removed
- `bluebird` — replaced by native Promises
- `request` — replaced by `node-fetch`
- `restler` — replaced by `HttpUtils.file()` + `form-data`

### Dependencies Added / Upgraded
- `node-fetch@^2.7.0` (new)
- `form-data@^4.0.0` (new)
- `protobufjs@^7.0.0` (upgraded from v5)
- `ws@^8.0.0` (upgraded from v1)
