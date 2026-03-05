# Phase 4 — Low: Enhancements

> **Priority:** 🟢 Low  
> **Status:** ✅ Complete  
> **Issues:** prosocial#196, prosocial#161, prosocial#158, prosocial#157  
> **Depends on:** Phase 1 (HttpUtils rewrite must be done for download/copy to work)  
> **Completed:** copyBits, copyPackage, downloadBits, downloadDroplet added to Apps.js. TypeScript types updated.

---

## Context Links

- [Issue Doc: prosocial#196 — Copy bits](../../docs/issues/prosocial-196-copy-bits-between-apps.md)
- [Issue Doc: prosocial#161 — Improve JSDocs](../../docs/issues/prosocial-161-improve-jsdocs.md)
- [Issue Doc: prosocial#158 — Download droplet](../../docs/issues/prosocial-158-download-droplet.md)
- [Issue Doc: prosocial#157 — Download bits](../../docs/issues/prosocial-157-download-bits.md)

---

## Issue 1: Copy Bits Between Apps (prosocial#196)

### Problem
No method to copy application bits from one app to another. CF v2 API has `POST /v2/apps/:guid/copy_bits`.

### Fix — Add to `Apps.js`

```javascript
/**
 * Copy bits from one app to another (v2 only)
 * {@link http://apidocs.cloudfoundry.org/226/apps/copy_the_app_bits_for_an_app.html}
 *
 * @param {String} targetAppGuid - Target app GUID (destination)
 * @param {String} sourceAppGuid - Source app GUID
 * @return {Promise}
 */
copyBits(targetAppGuid, sourceAppGuid) {
    if (this.isUsingV3()) {
        // v3 uses packages/droplets workflow instead of direct copy
        throw new Error(
            "copyBits is not available in CF API v3. " +
            "Use packages API: POST /v3/packages with source package GUID instead."
        );
    }

    const url = `${this.API_URL}/v2/apps/${targetAppGuid}/copy_bits`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
            "Content-Type": "application/json"
        },
        json: { source_app_guid: sourceAppGuid }
    };

    return this.REST.request(options, this.HttpStatus.CREATED, true);
}

/**
 * Copy a package from one app to another (v3)
 * {@link https://v3-apidocs.cloudfoundry.org/#copy-a-package}
 *
 * @param {String} sourcePackageGuid - Source package GUID
 * @param {String} targetAppGuid - Target app GUID
 * @return {Promise}
 */
copyPackage(sourcePackageGuid, targetAppGuid) {
    if (!this.isUsingV3()) {
        throw new Error("copyPackage is only available in CF API v3. Use copyBits for v2.");
    }

    const url = `${this.API_URL}/v3/packages?source_guid=${sourcePackageGuid}`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
            "Content-Type": "application/json"
        },
        json: {
            relationships: {
                app: { data: { guid: targetAppGuid } }
            }
        }
    };

    return this.REST.request(options, this.HttpStatus.CREATED, true);
}
```

### Files to Modify
- `lib/model/cloudcontroller/Apps.js`

---

## Issue 2: Download Bits from App (prosocial#157)

### Problem
No method to download an app's source bits (the uploaded zip).

### Fix — Add to `Apps.js`

```javascript
/**
 * Download app bits (source code zip)
 * v2: {@link http://apidocs.cloudfoundry.org/226/apps/downloads_the_bits_for_an_app.html}
 * v3: uses packages API to download
 *
 * @param {String} appGuid - Application GUID
 * @return {Promise} Resolves with binary data (zip)
 */
downloadBits(appGuid) {
    if (this.isUsingV3()) {
        return this._downloadBitsV3(appGuid);
    }
    return this._downloadBitsV2(appGuid);
}

_downloadBitsV2(appGuid) {
    const url = `${this.API_URL}/v2/apps/${appGuid}/download`;
    const options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
        },
        encoding: null  // binary
    };
    return this.REST.request(options, this.HttpStatus.OK, false);
}

_downloadBitsV3(appGuid) {
    // v3: First get the current package, then download it
    const url = `${this.API_URL}/v3/apps/${appGuid}/packages?order_by=-created_at&per_page=1`;
    const options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
            "Content-Type": "application/json"
        },
        json: true
    };

    return this.REST.request(options, this.HttpStatus.OK, true).then(result => {
        if (!result.resources || result.resources.length === 0) {
            throw new Error("No packages found for app " + appGuid);
        }
        const packageGuid = result.resources[0].guid;
        return this.downloadPackage(packageGuid);
    });
}

/**
 * Download a specific package by GUID (v3)
 * @param {String} packageGuid - Package GUID
 * @return {Promise} Resolves with binary data
 */
downloadPackage(packageGuid) {
    const url = `${this.API_URL}/v3/packages/${packageGuid}/download`;
    const options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
        },
        encoding: null
    };
    return this.REST.request(options, this.HttpStatus.OK, false);
}
```

### Files to Modify
- `lib/model/cloudcontroller/Apps.js`

---

## Issue 3: Download Droplet from App (prosocial#158)

### Problem
No method to download a compiled droplet (the built artifact after staging).

### Fix — Add to `Apps.js`

```javascript
/**
 * Download the current droplet for an app
 * v2: GET /v2/apps/:guid/droplet/download
 * v3: GET /v3/droplets/:guid/download
 *
 * @param {String} appGuid - Application GUID
 * @return {Promise} Resolves with binary droplet data (tgz)
 */
downloadDroplet(appGuid) {
    if (this.isUsingV3()) {
        return this._downloadDropletV3(appGuid);
    }
    return this._downloadDropletV2(appGuid);
}

_downloadDropletV2(appGuid) {
    const url = `${this.API_URL}/v2/apps/${appGuid}/droplet/download`;
    const options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
        },
        encoding: null
    };
    return this.REST.request(options, this.HttpStatus.OK, false);
}

_downloadDropletV3(appGuid) {
    // v3: First get current droplet GUID, then download
    const url = `${this.API_URL}/v3/apps/${appGuid}/droplets/current`;
    const options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`,
            "Content-Type": "application/json"
        },
        json: true
    };

    return this.REST.request(options, this.HttpStatus.OK, true).then(droplet => {
        const dropletUrl = `${this.API_URL}/v3/droplets/${droplet.guid}/download`;
        const dlOptions = {
            method: "GET",
            url: dropletUrl,
            headers: {
                Authorization: `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`
            },
            encoding: null
        };
        return this.REST.request(dlOptions, this.HttpStatus.OK, false);
    });
}
```

### Files to Modify
- `lib/model/cloudcontroller/Apps.js`

---

## Issue 4: Improve JSDocs & TypeScript Types (prosocial#161)

### Problem
JSDoc comments are inconsistent. TypeScript type definitions in `types/index.d.ts` are incomplete — missing new methods and correct signatures.

### Fix

1. **Audit all JSDoc comments** — ensure every public method has:
   - `@param` with correct types
   - `@return` with Promise generic type
   - `@throws` when applicable
   - `@example` for complex methods
   - `@since` version tag

2. **Update `types/index.d.ts`** — add declarations for ALL new methods from Phases 1-4:

```typescript
// New methods to add to types/index.d.ts

// ServiceInstances additions
export declare class ServiceInstances extends CloudControllerBase {
    // ... existing methods ...
    getInstancesBySpace(spaceGuid: string, filter?: object): Promise<any>;
    getInstanceByNameInSpace(name: string, spaceGuid: string): Promise<any>;
    getOperationStatus(guid: string): Promise<any>;
    startInstance(guid: string, params?: object): Promise<any>;
    stopInstance(guid: string, params?: object): Promise<any>;
    add(options: object, acceptsIncomplete?: boolean): Promise<any>;
    update(guid: string, options: object, acceptsIncomplete?: boolean): Promise<any>;
    remove(guid: string, options?: object, acceptsIncomplete?: boolean): Promise<any>;
}

// UsersUAA additions
export declare class UsersUAA {
    // ... existing methods ...
    loginWithClientCredentials(clientId: string, clientSecret: string): Promise<any>;
    loginWithPasscode(passcode: string): Promise<any>;
    loginWithAuthorizationCode(code: string, redirectUri: string): Promise<any>;
    getTokenInfo(accessToken: string): Promise<any>;
    decodeToken(token: string): object;
}

// Apps additions
export declare class Apps extends CloudControllerBase {
    // ... existing methods ...
    copyBits(targetAppGuid: string, sourceAppGuid: string): Promise<any>;
    copyPackage(sourcePackageGuid: string, targetAppGuid: string): Promise<any>;
    downloadBits(appGuid: string): Promise<Buffer>;
    downloadPackage(packageGuid: string): Promise<Buffer>;
    downloadDroplet(appGuid: string): Promise<Buffer>;
}

// Logs additions
export declare class Logs {
    // ... existing methods ...
    getRecentParsed(appGuid: string): Promise<LogEntry[]>;
}

export interface LogEntry {
    timestamp: Date | null;
    message: string;
    sourceType: string;
    sourceInstance: string;
    messageType: "OUT" | "ERR";
}
```

3. **Generate JSDoc HTML docs** (optional bonus):
   - Update `Gruntfile.js` jsdoc config or switch to `typedoc`
   - Output to `docs/api/`

### Files to Modify
- `types/index.d.ts` — Add all new method declarations
- All `lib/**/*.js` — Standardize JSDoc format
- `Gruntfile.js` — Optional: update jsdoc config

---

## Todo List

- [ ] Add `copyBits()` to Apps.js (v2)
- [ ] Add `copyPackage()` to Apps.js (v3)
- [ ] Add `downloadBits()` / `downloadPackage()` to Apps.js
- [ ] Add `downloadDroplet()` to Apps.js
- [ ] Audit and standardize all JSDoc comments
- [ ] Update `types/index.d.ts` with ALL new method types from Phases 1-4
- [ ] Run `tsc --noEmit` to verify type declarations
- [ ] Write unit tests for copy/download methods

---

## Success Criteria

- [ ] `copyBits()` copies app source between two apps (v2)
- [ ] `copyPackage()` copies package to target app (v3)
- [ ] `downloadBits()` returns binary zip data
- [ ] `downloadDroplet()` returns binary tgz data
- [ ] `tsc --noEmit` passes with no errors
- [ ] All public methods have complete JSDoc comments

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Download binary encoding issues after HttpUtils rewrite | Medium | Test with `node-fetch` binary response (`response.buffer()`) |
| v3 copy workflow is multi-step (package → copy → stage) | Medium | Document the full workflow, implement atomic `copyPackage()` |
| Type definitions drift from implementation | Low | Run `tsc --noEmit` in CI to catch mismatches |
| JSDoc update is labor-intensive | Low | Prioritize public API methods; internal methods can be brief |
