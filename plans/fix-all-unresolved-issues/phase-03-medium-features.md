# Phase 3 — Medium: Missing Features

> **Priority:** 🟡 Medium  
> **Status:** ✅ Complete  
> **Issues:** prosocial#156, ibm#44, ibm#15, prosocial#199, prosocial#183, prosocial#173  
> **Depends on:** Phase 1 (HttpUtils rewrite), Phase 2 (bug fixes)  
> **Completed:** URL validation, client_credentials/passcode/authcode auth, getTokenInfo, decodeToken, Logs.parseLogs, CfIgnoreHelper.

---

## Context Links

- [Issue Doc: prosocial#156 — URL validation](../../docs/issues/prosocial-156-url-validation.md)
- [Issue Doc: ibm#44 — APIKey auth](../../docs/issues/ibm-044-apikey-auth.md)
- [Issue Doc: ibm#15 — getTokenInfo](../../docs/issues/ibm-015-get-token-info.md)
- [Issue Doc: prosocial#199 — HANA Cloud start/stop](../../docs/issues/prosocial-199-hana-cloud-start-stop.md)
- [Issue Doc: prosocial#183 — Log timestamp](../../docs/issues/prosocial-183-log-timestamp-missing.md)
- [Issue Doc: prosocial#173 — .cfignore support](../../docs/issues/prosocial-173-cfignore-support.md)

---

## Issue 1: URL Validation in Constructors (prosocial#156)

### Problem
No validation on endpoint URLs passed to constructors. Typos, missing protocols, trailing slashes cause cryptic errors later.

### Fix — `CloudControllerBase.js`

Add a `_validateEndpoint()` method called from constructor and `setEndPoint()`:

```javascript
/**
 * Validate and normalize endpoint URL
 * @param {String} endPoint - API endpoint URL
 * @return {String} Normalized URL
 * @throws {Error} If URL is invalid
 */
_validateEndpoint(endPoint) {
    if (!endPoint || typeof endPoint !== "string") {
        throw new Error("Endpoint URL is required and must be a string");
    }

    // Remove trailing slash
    let normalized = endPoint.replace(/\/+$/, "");

    // Check protocol
    if (!/^https?:\/\//i.test(normalized)) {
        throw new Error(`Invalid endpoint URL: "${endPoint}". Must start with http:// or https://`);
    }

    // Basic URL structure check
    try {
        new URL(normalized);
    } catch (e) {
        throw new Error(`Invalid endpoint URL: "${endPoint}". ${e.message}`);
    }

    return normalized;
}
```

Update constructor and setEndPoint:
```javascript
constructor(endPoint, options = {}) {
    this.API_URL = this._validateEndpoint(endPoint);
    // ... rest unchanged
}

setEndPoint(endPoint) {
    this.API_URL = this._validateEndpoint(endPoint);
}
```

Also apply same validation to `UsersUAA.js` constructor and `Logs.js` setEndPoint.

### Files to Modify
- `lib/model/cloudcontroller/CloudControllerBase.js`
- `lib/model/uaa/UsersUAA.js`
- `lib/model/metrics/Logs.js`

---

## Issue 2: APIKey / Client Credentials Auth (ibm#44)

### Problem
`UsersUAA.login()` only supports `grant_type: "password"`. Many CF deployments use API keys or client credentials.

### Fix — Add new auth methods to `UsersUAA.js`

```javascript
/**
 * Authenticate using client credentials (service-to-service)
 * @param {String} clientId - OAuth client ID
 * @param {String} clientSecret - OAuth client secret
 * @return {Promise} UAA token response
 */
loginWithClientCredentials(clientId, clientSecret) {
    const url = `${this.UAA_API_URL}/oauth/token`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "client_credentials"
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}

/**
 * Authenticate using API key (passcode-based)
 * @param {String} passcode - One-time passcode from /passcode endpoint
 * @return {Promise} UAA token response
 */
loginWithPasscode(passcode) {
    const url = `${this.UAA_API_URL}/oauth/token`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: "Basic Y2Y6",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "password",
            passcode: passcode
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}

/**
 * Authenticate using authorization code (OAuth2 code flow)
 * @param {String} code - Authorization code
 * @param {String} redirectUri - Redirect URI used in authorization request
 * @return {Promise} UAA token response
 */
loginWithAuthorizationCode(code, redirectUri) {
    const url = `${this.UAA_API_URL}/oauth/token`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: "Basic Y2Y6",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectUri
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

### Files to Modify
- `lib/model/uaa/UsersUAA.js`

---

## Issue 3: getTokenInfo() Method (ibm#15)

### Problem
No method to decode/inspect an access token. Users need to check token expiry, scopes, and user info.

### Fix — Add to `UsersUAA.js`

```javascript
/**
 * Get token information (decode token via UAA /check_token endpoint)
 * @param {String} accessToken - Access token to inspect
 * @return {Promise} Token info including user_id, user_name, email, scope, exp
 */
getTokenInfo(accessToken) {
    const url = `${this.UAA_API_URL}/check_token`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: "Basic Y2Y6",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            token: accessToken
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}

/**
 * Decode a JWT token locally (without UAA call)
 * WARNING: Does NOT verify signature. Use for reading claims only.
 * @param {String} token - JWT token string
 * @return {Object} Decoded token payload
 */
decodeToken(token) {
    try {
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format");
        }
        const payload = Buffer.from(parts[1], "base64url").toString("utf8");
        return JSON.parse(payload);
    } catch (err) {
        throw new Error(`Failed to decode token: ${err.message}`);
    }
}
```

### Files to Modify
- `lib/model/uaa/UsersUAA.js`

---

## Issue 4: HANA Cloud DB Start/Stop (prosocial#199)

### Problem
No methods to start/stop service instances (used by SAP HANA Cloud which supports instance lifecycle management via CF API).

### Fix — Add to `ServiceInstances.js`

CF API v3 supports updating service instance parameters which HANA Cloud uses for start/stop:

```javascript
/**
 * Start a service instance (e.g., HANA Cloud database)
 * Uses service-specific parameters via instance update
 * v3: PATCH /v3/service_instances/:guid with parameters
 *
 * @param {String} guid - Service instance GUID
 * @param {Object} startParams - Start parameters (platform-specific)
 * @return {Promise}
 */
startInstance(guid, startParams = {}) {
    const defaultParams = { data: { serviceStopped: false } };
    const params = Object.keys(startParams).length > 0 ? startParams : defaultParams;
    return this.update(guid, { parameters: params });
}

/**
 * Stop a service instance (e.g., HANA Cloud database)
 * Uses service-specific parameters via instance update
 *
 * @param {String} guid - Service instance GUID
 * @param {Object} stopParams - Stop parameters (platform-specific)
 * @return {Promise}
 */
stopInstance(guid, stopParams = {}) {
    const defaultParams = { data: { serviceStopped: true } };
    const params = Object.keys(stopParams).length > 0 ? stopParams : defaultParams;
    return this.update(guid, { parameters: params });
}
```

### Files to Modify
- `lib/model/cloudcontroller/ServiceInstances.js`

---

## Issue 5: Log Timestamp Missing (prosocial#183)

### Problem
`Logs.getRecent()` returns raw protobuf-encoded data without parsed timestamps. Users want human-readable log entries with timestamps.

### Fix — Add parsing method to `Logs.js`

```javascript
/**
 * Get recent logs with parsed timestamps and message data
 * @param {String} appGuid - Application GUID
 * @return {Promise} Array of parsed log entries with timestamps
 */
getRecentParsed(appGuid) {
    return this.getRecent(appGuid).then(rawData => {
        return this._parseLogEntries(rawData);
    });
}

/**
 * Parse raw log data into structured entries with timestamps
 * @param {String|Buffer} rawData - Raw log response
 * @return {Array} Parsed log entries
 * @private
 */
_parseLogEntries(rawData) {
    if (!rawData) return [];
    
    // If data is string, split by newline and parse each entry
    if (typeof rawData === "string") {
        return rawData
            .split("\n")
            .filter(line => line.trim().length > 0)
            .map(line => {
                try {
                    const parsed = JSON.parse(line);
                    return {
                        timestamp: parsed.timestamp ? new Date(parsed.timestamp / 1000000) : null,
                        message: parsed.message || line,
                        sourceType: parsed.source_type || "unknown",
                        sourceInstance: parsed.source_instance || "0",
                        messageType: parsed.message_type === 2 ? "ERR" : "OUT"
                    };
                } catch (e) {
                    return {
                        timestamp: null,
                        message: line,
                        sourceType: "unknown",
                        sourceInstance: "0",
                        messageType: "OUT"
                    };
                }
            });
    }
    return [{ timestamp: null, message: String(rawData), sourceType: "unknown", sourceInstance: "0", messageType: "OUT" }];
}
```

### Files to Modify
- `lib/model/metrics/Logs.js`

---

## Issue 6: .cfignore Support on Upload (prosocial#173)

### Problem
`Apps.upload()` sends ALL files in the directory. CF CLI respects `.cfignore` file (like `.gitignore`) to exclude files. This library doesn't.

### Fix — Create `.cfignore` parser utility and integrate into upload flow

**New file: `lib/utils/CfIgnoreHelper.js`**

```javascript
"use strict";
const fs = require("fs");
const path = require("path");

class CfIgnoreHelper {
    /**
     * Read .cfignore file and return list of patterns
     * @param {String} appDir - Application directory
     * @return {Array} Array of ignore patterns
     */
    static readIgnorePatterns(appDir) {
        const cfIgnorePath = path.join(appDir, ".cfignore");
        if (!fs.existsSync(cfIgnorePath)) return [];

        return fs.readFileSync(cfIgnorePath, "utf8")
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0 && !line.startsWith("#"));
    }

    /**
     * Check if a file path matches any ignore pattern
     * Supports basic glob patterns: *, **, ?, [chars]
     * @param {String} filePath - Relative file path
     * @param {Array} patterns - Array of ignore patterns
     * @return {Boolean} true if file should be ignored
     */
    static shouldIgnore(filePath, patterns) {
        for (const pattern of patterns) {
            if (this._matchPattern(filePath, pattern)) return true;
        }
        return false;
    }

    static _matchPattern(filePath, pattern) {
        // Convert glob pattern to regex
        let regex = pattern
            .replace(/\./g, "\\.")
            .replace(/\*\*/g, "{{GLOBSTAR}}")
            .replace(/\*/g, "[^/]*")
            .replace(/\?/g, "[^/]")
            .replace(/\{\{GLOBSTAR\}\}/g, ".*");

        // Handle directory patterns (ending with /)
        if (pattern.endsWith("/")) {
            regex = regex.replace(/\/$/, "(/.*)?$");
        } else {
            regex = `(^|/)${regex}($|/)`;
        }

        return new RegExp(regex).test(filePath);
    }
}

module.exports = CfIgnoreHelper;
```

**Integrate into `Apps.upload()` flow:**
- Before creating the zip archive, read `.cfignore` patterns
- Filter out matching files from the zip
- This requires modifying the zip creation step (wherever archiver is used)

### Files to Create
- `lib/utils/CfIgnoreHelper.js`

### Files to Modify
- `lib/model/cloudcontroller/Apps.js` — Integrate cfignore filtering in upload path

---

## Todo List

- [ ] Add `_validateEndpoint()` to CloudControllerBase
- [ ] Apply URL validation to UsersUAA and Logs constructors
- [ ] Add `loginWithClientCredentials()` to UsersUAA
- [ ] Add `loginWithPasscode()` to UsersUAA
- [ ] Add `loginWithAuthorizationCode()` to UsersUAA
- [ ] Add `getTokenInfo()` and `decodeToken()` to UsersUAA
- [ ] Add `startInstance()` / `stopInstance()` to ServiceInstances
- [ ] Add `getRecentParsed()` and `_parseLogEntries()` to Logs
- [ ] Create `CfIgnoreHelper.js` utility
- [ ] Integrate .cfignore into Apps.upload() flow
- [ ] Update `types/index.d.ts` for all new methods
- [ ] Write unit tests for each new feature

---

## Success Criteria

- [ ] Invalid URLs throw descriptive errors immediately on construction
- [ ] `loginWithClientCredentials()` returns valid token
- [ ] `getTokenInfo()` returns decoded token data
- [ ] `startInstance()` / `stopInstance()` send correct update parameters
- [ ] `getRecentParsed()` returns entries with Date timestamps
- [ ] Upload respects `.cfignore` patterns

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| URL validation too strict | Medium | Only validate protocol and basic structure; allow IP addresses |
| Client credentials auth format varies by provider | Medium | Test against SAP BTP, Tanzu, and IBM Cloud UAA |
| HANA Cloud start/stop params differ by version | Medium | Use configurable params, provide SAP-specific defaults |
| .cfignore glob edge cases | Low | Support basic patterns first; document unsupported patterns |
| Log format varies by CF version | Low | Graceful fallback in parser — return raw line on parse failure |
