# Phase 1 — Critical: Security & Dependency Replacement

> **Priority:** 🔴 Critical  
> **Status:** ✅ Complete  
> **Issues:** prosocial#198, ibm#50, ibm#52  
> **Blocking:** All other phases depend on this  
> **Completed:** Replaced `restler`/`request`/`bluebird` with `node-fetch` + `form-data`. Upgraded `protobufjs` v7, `ws` v8.

---

## Context Links

- [Issue Doc: prosocial#198 — restler bug](../../docs/issues/prosocial-198-apps-upload-restler-bug.md)
- [Issue Doc: ibm#50 — Node security alerts](../../docs/issues/ibm-050-node-security-alerts.md)
- [Issue Doc: ibm#52 — protobufjs vulnerability](../../docs/issues/ibm-052-protobufjs-vulnerability.md)

---

## Overview

Replace ALL deprecated/vulnerable dependencies with modern, maintained alternatives:

| Current Dep | Version | Problem | Replacement |
|-------------|---------|---------|-------------|
| `restler` | ^3.4.0 | Unmaintained since 2014, broken on Node 12+ | Remove entirely |
| `request` | ^2.81.0 | Deprecated since Feb 2020, multiple CVEs | `node-fetch` v3 or built-in `fetch` (Node 18+) |
| `ws` | ^1.1.1 | Old, missing security patches | `ws` ^8.x |
| `protobufjs` | ^5.0.1 | CVE-2023-36665 prototype pollution | `protobufjs` ^7.x |
| `bluebird` | ^3.0.6 | Unnecessary — native Promise since Node 4 | Native `Promise` |

---

## Key Insights

- `restler` is ONLY used in `HttpUtils.upload()` method (1 call site). Replacing it with `node-fetch` + `FormData` or built-in `fetch` is straightforward.
- `request` is used in `HttpUtils.request()` method — the core of ALL HTTP operations. Must be replaced carefully.
- `bluebird` is imported in `HttpUtils.js` only. All code uses standard Promise API. Drop-in removal.
- `protobufjs` is used in `Logs.js` for log message decoding. Upgrade to v7 requires syntax changes for protobuf loading.
- `ws` is used in `Logs.js` for WebSocket streaming. v8 is API-compatible, straightforward upgrade.

---

## Architecture Decision

### Option A: `node-fetch` v3 (Recommended for Node 14+)
- Drop-in replacement for `request` with modern API
- Supports FormData for file uploads (replaces restler)
- Works with Node 14+ (matches package.json engine requirement)

### Option B: Built-in `fetch` (Node 18+ only)  
- Zero dependencies
- Would require bumping engine requirement to Node 18+

**Decision: Option A** — maintains Node 14+ compatibility

---

## Related Code Files

### Files to Modify
- `lib/utils/HttpUtils.js` — Replace `request` + `restler` + `bluebird` with `node-fetch`
- `lib/model/metrics/Logs.js` — Update protobufjs usage for v7 API
- `package.json` — Update all dependencies
- `types/index.d.ts` — Update type definitions if interfaces change

### Files to Create
- `lib/utils/FormDataHelper.js` — Helper for multipart file uploads (replacing restler's role)

### Files to Delete
- None (we modify in-place)

---

## Implementation Steps

### Step 1.1 — Replace `request` with `node-fetch` in HttpUtils

**Current code (`HttpUtils.request()`):**
```javascript
const request = require("request");
// ...
const requestWithDefaults = request.defaults({ rejectUnauthorized: false });
requestWithDefaults(options, function (error, response, body) { ... });
```

**New code:**
```javascript
const fetch = require("node-fetch");
const https = require("https");

const agent = new https.Agent({ rejectUnauthorized: false });

async request(options, httpStatusAssert, jsonOutput) {
    const fetchOptions = {
        method: options.method || "GET",
        headers: options.headers || {},
        agent: options.url.startsWith("https") ? agent : undefined
    };

    if (options.body) fetchOptions.body = options.body;
    if (options.form) {
        fetchOptions.body = new URLSearchParams(options.form).toString();
        fetchOptions.headers["Content-Type"] = "application/x-www-form-urlencoded";
    }
    if (options.json && typeof options.json === "object") {
        fetchOptions.body = JSON.stringify(options.json);
        fetchOptions.headers["Content-Type"] = "application/json";
    }

    let url = options.url;
    if (options.qs) {
        const params = new URLSearchParams(options.qs);
        url += (url.includes("?") ? "&" : "?") + params.toString();
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    if (response.status !== httpStatusAssert) {
        throw new Error(text || "EMPTY_BODY");
    }

    return jsonOutput ? JSON.parse(text) : text;
}
```

### Step 1.2 — Replace `restler` with `node-fetch` + `FormData` in HttpUtils.upload()

**Current code:**
```javascript
const rest = require("restler");
rest.put(url, options).on("complete", function (result, response) { ... });
```

**New code:**
```javascript
const FormData = require("form-data");
const fs = require("fs");

async upload(url, options, httpStatusAssert, jsonOutput) {
    const form = new FormData();
    
    // Map restler multipart options to FormData
    if (options.multipart) {
        for (const [key, value] of Object.entries(options.multipart)) {
            if (value && value.path) {
                form.append(key, fs.createReadStream(value.path), {
                    filename: value.filename || path.basename(value.path),
                    contentType: value["content-type"]
                });
            } else {
                form.append(key, value);
            }
        }
    }

    const fetchOptions = {
        method: "PUT",
        headers: {
            ...options.accessToken ? { Authorization: options.accessToken } : {},
            ...form.getHeaders()
        },
        body: form,
        agent: url.startsWith("https") ? agent : undefined
    };

    const response = await fetch(url, fetchOptions);
    const text = await response.text();

    if (response.status !== httpStatusAssert) {
        throw new Error(text || "Upload failed");
    }

    return jsonOutput ? JSON.parse(text) : text;
}
```

### Step 1.3 — Remove `bluebird` dependency

All code already uses standard Promise patterns. Simply:
1. Remove `const Promise = require("bluebird");` from HttpUtils.js
2. Use native `Promise` (already global)
3. Remove from `package.json`

### Step 1.4 — Upgrade `protobufjs` to v7

```bash
npm install protobufjs@^7.0.0 --save
```

Update any `.load()` calls in Logs.js from v5 API to v7 API:
- v5: `protobuf.loadProtoFile(protoFile)` → v7: `protobuf.load(protoFile)`
- v5: `builder.build("package.Message")` → v7: `root.lookupType("package.Message")`

### Step 1.5 — Upgrade `ws` to v8

```bash
npm install ws@^8.0.0 --save
```

- v8 `ws` is mostly API-compatible with v1
- Main change: constructor options format (already compatible for basic usage)
- Verify WebSocket connection in Logs.js still works

### Step 1.6 — Update package.json

```json
{
  "dependencies": {
    "form-data": "^4.0.0",
    "node-fetch": "^2.7.0",
    "protobufjs": "^7.0.0",
    "ws": "^8.0.0"
  }
}
```

> Note: Using `node-fetch` v2 (CommonJS) instead of v3 (ESM-only) for compatibility with current `require()` module system.

### Step 1.7 — Update `requestV3()` and `requestV2()` helper methods

These convenience methods in HttpUtils also need to be updated to use the new `request()` signature. The interface remains the same — they just call the updated `request()` internally.

---

## Todo List

- [ ] Install `node-fetch@^2.7.0` and `form-data@^4.0.0`
- [ ] Rewrite `HttpUtils.request()` using `node-fetch`
- [ ] Rewrite `HttpUtils.upload()` using `node-fetch` + `form-data`
- [ ] Remove `bluebird` import and dependency
- [ ] Update `requestV3()` and `requestV2()` methods
- [ ] Remove `request` and `restler` from package.json
- [ ] Upgrade `protobufjs` to v7 and update Logs.js
- [ ] Upgrade `ws` to v8 and verify Logs.js WebSocket
- [ ] Run all existing tests
- [ ] Test file upload manually against a CF instance

---

## Success Criteria

- [ ] `npm audit` shows 0 critical/high vulnerabilities
- [ ] `HttpUtils.request()` works with all HTTP methods (GET/POST/PUT/PATCH/DELETE)
- [ ] `HttpUtils.upload()` successfully uploads zip files to CF
- [ ] All existing tests pass without modification
- [ ] No `restler` or `request` imports remain in codebase
- [ ] Package size reduced (fewer deps)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| `node-fetch` v2 vs v3 confusion | High | Pin to v2.7.0 (CommonJS compatible) |
| Upload multipart format mismatch | High | Test against real CF API, compare wire format with restler output |
| `protobufjs` v7 breaking changes | Medium | Logs.js is isolated, easy to test independently |
| Callback→async migration breaks callers | Medium | All callers already use `.then()` — async functions return Promise natively |
| Query string encoding differences | Low | `URLSearchParams` handles encoding same as `request` |

---

## Security Considerations

- Remove `rejectUnauthorized: false` as default; make it configurable via options
- Consider adding request timeout (currently none)
- Validate URL protocol (https only in production)
