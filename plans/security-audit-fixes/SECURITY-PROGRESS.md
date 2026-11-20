# Security release 1.1.0 — verified summary

Owner selected v1.1.0 and requested security impact review, plan.md update, lint and pub:dry. No publication authorized. Existing uncommitted generated `doc/` HTML is owner-owned, was not staged or overwritten.

Implemented C1 TLS verification by default (`skipSslValidation`/`ca` per instance); H2 remote HTTP rejection (`allowInsecureHttp` opt-in and loopback exception); H1 removal of unused runtime `protobufjs`/`ws`; M1 patched `form-data` ^4.0.6; M2 URL-encoded 143 model URL identifiers plus ApiVersionManager resource ID; M3 cache clears on token/endpoint switch; I3 removed endpoint logging. Security-focused tests cover defaults, options, cache isolation and path/query injection. User-visible break: self-signed/private-CA endpoints and remote HTTP require explicit configuration; already-percent-encoded IDs should be passed raw. Migration details: MIGRATION_GUIDE.md, README.md, CHANGELOG.md; remaining finding impact decisions and verification: plan.md.

Verification: npm run lint PASS; npm test 178 passing, 1 pre-existing pending; npm run tsc:check PASS; npm audit --omit=dev 0 vulnerabilities; npm audit including dev 22 remaining (14 high, 8 moderate); npm run pub:dry PASS on version 1.1.0, 40 files, no publish. No live CF integration run.

Deferred: M4 CI pinning/provenance; L1 default timeout/streaming, L2 v2 filter grammar, L3 UAA raw filter, L4 error contract, L5 dev dependency remediation, I1/I2 documentation/response claims. These are not represented as fixed.
STATUS: ALL DONE (scoped security release; deferred findings documented)
