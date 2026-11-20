# CF API v3.237.0 delivery ledger

Source: https://v3-apidocs.cloudfoundry.org/version/3.237.0/
Inventory: `plans/v3-237-inventory/operations.json` contains 247 documented Definition operations (245 distinct method/path pairs, including the unauthenticated `/` and `/v3` discovery endpoints). The comparison in `coverage.json` is **literal path evidence only**; it must not be interpreted as exact high-level client coverage.
Implementation: `V3Api.invoke(anchor, options)` dispatches all 247 operations, supports JSON/query/path variables and multipart, handles documented alternative statuses and redirect Location safely, and can return asynchronous Location metadata. Existing high-level clients were not replaced. Runtime registry is included in the npm package.
Verification: 173 unit tests passing, 1 pre-existing pending; `npm run tsc:check` green; every registry operation's method, path and status exercised by stub test; multipart/redirect/asynchronous response tested against local synthetic HTTP server; installed npm tarball smoke test verified 247 exports. Commits: 835619d, daaa54d, d7f376c. Existing untracked `plans/security-audit-fixes/` was untouched.
Limitations: this is full **low-level documented HTTP operation reachability**, not individually typed high-level methods or full request/response JSON-schema validation. No live Cloud Foundry deployment was available for integration testing. Historical audit `plans/reports/audit-v3-api-full-report.md` targeted v3.209.0, not this version.
STATUS: ALL DONE (low-level operation coverage; live CF validation unavailable)
