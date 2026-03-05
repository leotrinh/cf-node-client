# Issue #50 — Node Security Alerts

- **Source:** [IBM-Cloud/cf-nodejs-client#50](https://github.com/IBM-Cloud/cf-nodejs-client/issues/50)
- **Status:** NOT RESOLVED
- **Priority:** Critical (Security)
- **Created:** 2019-03-14

## Description
Multiple npm security advisories flagged for dependencies.

## Vulnerable Dependencies
| Package | Current | Issue | Action |
|---------|---------|-------|--------|
| `restler` | ^3.4.0 | Unmaintained, known vulns | Replace with `form-data` + `axios` |
| `request` | ^2.81.0 | Deprecated since Feb 2020 | Replace with `axios` or `node-fetch` |
| `ws` | ^1.1.1 | Multiple CVEs in v1.x | Update to v8+ |
| `protobufjs` | ^5.0.1 | CVEs, major version behind | Update to v7+ |
| `bluebird` | ^3.0.6 | Outdated (functional) | Consider native Promises |

## Dev Dependencies (also outdated)
- `eslint@1.10.3` → update to 8+
- `mocha@2.3.4` → update to 10+
- `istanbul@0.4.1` → replace with `c8` or `nyc`

## Resolution Plan
- Phase 1: Replace `restler` and `request` (critical — blocks modern Node.js).
- Phase 2: Update `ws` and `protobufjs`.
- Phase 3: Update dev dependencies.
- Run `npm audit fix` after each phase.

## Related
- prosocial#198 (restler causes upload failure).
- IBM-Cloud#52 (protobufjs vulnerability).
