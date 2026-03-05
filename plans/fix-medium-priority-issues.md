# Implementation Plan: Fix All MEDIUM Priority Issues

**Date:** March 5, 2026  
**Version:** 1.0.8 (next release)  
**Total Issues:** 6 MEDIUM priority

---

## Overview

This plan addresses all remaining MEDIUM priority issues from the upstream repositories. All fixes will be implemented with full test coverage and TypeScript type declarations.

### Issues to Fix

| # | Origin | Issue | Complexity |
|---|--------|-------|------------|
| M1 | prosocial#199 | HANA Cloud DB start/stop control | Low |
| M2 | prosocial#156 | URL validation in constructors | Low |
| M3 | IBM#44 | APIKey authentication | Medium |
| M4 | IBM#47 | Same-name services in different spaces | Low |
| M5 | IBM#15 | `getTokenInfo(accessToken)` method | Medium |
| M6 | prosocial#183 | Log timestamp missing | Medium-High |

---

## Phase 1: Service Instance Enhancements (M1 + M4)

### M1 — HANA Cloud Start/Stop Control

**File:** `lib/model/cloudcontroller/ServiceInstances.js`

Add convenience methods for HANA Cloud lifecycle management:

```javascript
/**
 * Start a managed service instance (e.g., HANA Cloud DB).
 * Sends PATCH with serviceStopped=false parameter.
 * Only works for managed service instances that support lifecycle operations.
 * 
 * @param {String} guid - Service instance GUID
 * @return {Promise} Resolves when start operation is accepted (202)
 */
startInstance(guid) {
    const updateOptions = {
        parameters: {
            data: {
                serviceStopped: false
            }
        }
    };
    return this.update(guid, updateOptions, true); // acceptsIncomplete=true
}

/**
 * Stop a managed service instance (e.g., HANA Cloud DB).
 * Sends PATCH with serviceStopped=true parameter.
 * 
 * @param {String} guid - Service instance GUID
 * @return {Promise} Resolves when stop operation is accepted (202)
 */
stopInstance(guid) {
    const updateOptions = {
        parameters: {
            data: {
                serviceStopped: true
            }
        }
    };
    return this.update(guid, updateOptions, true);
}
```

**TypeScript:** Add to `types/index.d.ts`:
```typescript
export class ServiceInstances extends CloudControllerBase {
  // ... existing methods
  startInstance(guid: string): Promise<any>;
  stopInstance(guid: string): Promise<any>;
}
```

---

### M4 — Same-Name Services in Different Spaces

**File:** `lib/model/cloudcontroller/ServiceInstances.js`

Add space-scoped query methods:

```javascript
/**
 * Get service instances filtered by space GUID.
 * Useful when multiple service instances share the same name across different spaces.
 * 
 * @param {String} spaceGuid - Space GUID to filter by
 * @param {Object} [filter] - Additional filter options
 * @return {Promise} Resolves with filtered service instances
 */
getInstancesBySpace(spaceGuid, filter = {}) {
    if (this.isUsingV3()) {
        return this._getInstancesBySpaceV3(spaceGuid, filter);
    }
    return this._getInstancesBySpaceV2(spaceGuid, filter);
}

_getInstancesBySpaceV2(spaceGuid, filter) {
    const combinedFilter = Object.assign({}, filter);
    // Add space_guid filter
    const spaceFilter = `space_guid:${spaceGuid}`;
    if (combinedFilter.q) {
        combinedFilter.q = `${combinedFilter.q};${spaceFilter}`;
    } else {
        combinedFilter.q = spaceFilter;
    }
    return this.getInstances(combinedFilter);
}

_getInstancesBySpaceV3(spaceGuid, filter) {
    const combinedFilter = Object.assign({}, filter);
    combinedFilter.space_guids = spaceGuid;
    return this.getInstances(combinedFilter);
}

/**
 * Get a service instance by name within a specific space.
 * Essential when service instances with the same name exist in different spaces.
 * 
 * @param {String} name - Service instance name
 * @param {String} spaceGuid - Space GUID
 * @return {Promise} Resolves with service instance or null
 */
getInstanceByNameInSpace(name, spaceGuid) {
    return this.getInstancesBySpace(spaceGuid)
        .then(result => {
            const resources = result.resources || [];
            const match = resources.find(r => {
                const entityName = r.entity?.name || r.name;
                return entityName === name;
            });
            return match || null;
        });
}
```

**TypeScript:** Already declared in `types/index.d.ts` ✅

---

## Phase 2: URL Validation (M2)

**File:** `lib/model/cloudcontroller/CloudControllerBase.js`

Add URL validation helper and update constructor:

```javascript
/**
 * Validate Cloud Foundry API endpoint URL format.
 * @private
 */
_validateEndpoint(url) {
    if (!url || typeof url !== 'string') {
        throw new Error('Invalid Cloud Foundry API endpoint: must be a non-empty string');
    }
    
    // Allow both http and https for local testing
    const urlPattern = /^https?:\/\/[a-zA-Z0-9][-a-zA-Z0-9.]*[a-zA-Z0-9](:\d+)?$/;
    if (!urlPattern.test(url)) {
        throw new Error(
            `Invalid Cloud Foundry API endpoint: "${url}". ` +
            `Expected format: https://api.example.com`
        );
    }
}

constructor(endPoint, options = {}) {
    this._validateEndpoint(endPoint);
    this.API_URL = endPoint;
    // ... rest unchanged
}

setEndPoint(endPoint) {
    this._validateEndpoint(endPoint);
    this.API_URL = endPoint;
}
```

**Test:** Add to `test/lib/ApiMigrationTests.js`:
```javascript
describe('URL Validation', function () {
    it('should reject empty endpoint', function () {
        expect(() => new CloudController('')).to.throw(/non-empty string/);
    });
    
    it('should reject invalid URL format', function () {
        expect(() => new CloudController('not-a-url')).to.throw(/Invalid Cloud Foundry API endpoint/);
    });
    
    it('should accept valid https URL', function () {
        expect(() => new CloudController('https://api.example.com')).to.not.throw();
    });
    
    it('should accept http for local testing', function () {
        expect(() => new CloudController('http://localhost:9000')).to.not.throw();
    });
});
```

---

## Phase 3: UAA Enhancements (M3 + M5)

### M3 — APIKey Authentication

**File:** `lib/model/uaa/UsersUAA.js`

Add API key and client credentials auth:

```javascript
/**
 * Authenticate using IBM Cloud API Key.
 * @param {String} apiKey - IBM Cloud API Key
 * @return {Promise<OAuthToken>} OAuth token object
 */
loginWithApiKey(apiKey) {
    const url = `${this.UAA_URL}/oauth/token`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: `Basic ${Buffer.from("cf:").toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "urn:ibm:params:oauth:grant-type:apikey",
            apikey: apiKey
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}

/**
 * Authenticate using OAuth2 client credentials.
 * @param {String} clientId - OAuth client ID
 * @param {String} clientSecret - OAuth client secret
 * @return {Promise<OAuthToken>} OAuth token object
 */
loginWithClientCredentials(clientId, clientSecret) {
    const url = `${this.UAA_URL}/oauth/token`;
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: `Basic ${basicAuth}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            grant_type: "client_credentials"
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

**TypeScript:** Add to `types/index.d.ts`:
```typescript
export class UsersUAA {
  // ... existing methods
  loginWithApiKey(apiKey: string): Promise<OAuthToken>;
  loginWithClientCredentials(clientId: string, clientSecret: string): Promise<OAuthToken>;
  getTokenInfo(accessToken: string): Promise<TokenInfo>;
}

export interface TokenInfo {
  username: string;
  email?: string;
  userGuid: string;
  scopes?: string[];
  exp?: number;
}
```

---

### M5 — Token Info Decoder

**File:** `lib/model/uaa/UsersUAA.js`

Add JWT token decoding:

```javascript
/**
 * Decode access token to extract user information.
 * Decodes JWT payload locally without server validation.
 * 
 * @param {String} accessToken - UAA access token (JWT)
 * @return {Promise<Object>} Token info { username, email, userGuid, scopes, exp }
 */
getTokenInfo(accessToken) {
    return new Promise((resolve, reject) => {
        try {
            // JWT format: header.payload.signature
            const parts = accessToken.split('.');
            if (parts.length !== 3) {
                throw new Error('Invalid JWT token format');
            }
            
            // Decode base64url payload
            const payload = parts[1];
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = Buffer.from(base64, 'base64').toString('utf8');
            const claims = JSON.parse(decoded);
            
            // Extract relevant fields
            const tokenInfo = {
                username: claims.user_name || claims.username,
                email: claims.email,
                userGuid: claims.user_id,
                scopes: claims.scope || [],
                exp: claims.exp
            };
            
            resolve(tokenInfo);
        } catch (error) {
            reject(new Error(`Failed to decode token: ${error.message}`));
        }
    });
}

/**
 * Validate token with UAA server (server-side validation).
 * More secure but requires network call.
 * 
 * @param {String} accessToken - UAA access token
 * @return {Promise<Object>} Validated token info
 */
checkToken(accessToken) {
    const url = `${this.UAA_URL}/check_token`;
    const options = {
        method: "POST",
        url: url,
        headers: {
            Authorization: `Basic ${Buffer.from("cf:").toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        form: {
            token: accessToken
        }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

---

## Phase 4: Log Timestamp Enhancement (M6)

**File:** `lib/model/metrics/Logs.js`

Add structured log parsing:

```javascript
/**
 * Get recent logs with parsed timestamps and metadata.
 * Returns structured log entries instead of raw protobuf data.
 * 
 * @param {String} appGuid - Application GUID
 * @return {Promise<Array>} Array of structured log entries
 */
getRecentParsed(appGuid) {
    return this.getRecent(appGuid).then(logs => {
        // If logs is a Buffer (protobuf), decode it
        if (Buffer.isBuffer(logs)) {
            return this._parseProtobufLogs(logs);
        }
        // If logs is already an array, return as-is
        if (Array.isArray(logs)) {
            return logs;
        }
        // Otherwise try to parse as JSON
        return [];
    });
}

/**
 * Parse protobuf-encoded log messages.
 * @private
 */
_parseProtobufLogs(buffer) {
    try {
        const protobuf = require('protobufjs');
        // CF log envelope protobuf schema
        const logEnvelopeProto = `
            syntax = "proto3";
            message LogMessage {
                string message = 1;
                int32 message_type = 2;
                int64 timestamp = 3;
                string app_id = 4;
                string source_type = 5;
                string source_instance = 6;
            }
        `;
        
        const root = protobuf.parse(logEnvelopeProto).root;
        const LogMessage = root.lookupType("LogMessage");
        
        // Decode multiple messages
        const logs = [];
        let offset = 0;
        while (offset < buffer.length) {
            try {
                const decoded = LogMessage.decode(buffer.slice(offset));
                logs.push({
                    message: decoded.message,
                    timestamp: new Date(Number(decoded.timestamp) / 1000000), // nanoseconds to ms
                    messageType: decoded.message_type === 1 ? 'OUT' : 'ERR',
                    sourceType: decoded.source_type,
                    sourceInstance: decoded.source_instance,
                    appId: decoded.app_id
                });
                offset += decoded.message.length + 32; // approximate
            } catch (err) {
                break;
            }
        }
        return logs;
    } catch (error) {
        console.warn('Failed to parse protobuf logs:', error.message);
        return [];
    }
}
```

**TypeScript:** Add to `types/index.d.ts`:
```typescript
export interface LogEntry {
  message: string;
  timestamp: Date;
  messageType: 'OUT' | 'ERR';
  sourceType: string;
  sourceInstance: string;
  appId: string;
}

export class Logs {
  // ... existing methods
  getRecentParsed(appGuid: string): Promise<LogEntry[]>;
}
```

---

## Testing Strategy

### New Test File: `test/lib/MediumPriorityFixTests.js`

```javascript
describe("MEDIUM Priority Fixes — v1.0.8", function () {
    this.timeout(5000);

    describe("M1 — HANA Cloud start/stop", function () {
        it("startInstance should call update with serviceStopped=false");
        it("stopInstance should call update with serviceStopped=true");
    });

    describe("M2 — URL validation", function () {
        it("should reject empty URL");
        it("should reject invalid URL format");
        it("should accept valid https URL");
        it("should accept http for local dev");
    });

    describe("M3 — API Key auth", function () {
        it("loginWithApiKey should use IBM grant type");
        it("loginWithClientCredentials should use client_credentials grant");
    });

    describe("M4 — Space-filtered service instances", function () {
        it("getInstancesBySpace should add space_guid filter in v2");
        it("getInstancesBySpace should add space_guids param in v3");
        it("getInstanceByNameInSpace should find instance by name and space");
    });

    describe("M5 — Token info decoder", function () {
        it("getTokenInfo should decode JWT payload");
        it("getTokenInfo should extract username, email, userGuid");
        it("checkToken should validate with UAA server");
    });

    describe("M6 — Log timestamp parsing", function () {
        it("getRecentParsed should return structured log entries");
        it("should parse protobuf log messages with timestamps");
    });
});
```

**Total:** ~18 new unit tests

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/model/cloudcontroller/ServiceInstances.js` | Add startInstance, stopInstance, getInstancesBySpace, getInstanceByNameInSpace |
| `lib/model/cloudcontroller/CloudControllerBase.js` | Add _validateEndpoint, update constructor/setEndPoint |
| `lib/model/uaa/UsersUAA.js` | Add loginWithApiKey, loginWithClientCredentials, getTokenInfo, checkToken |
| `lib/model/metrics/Logs.js` | Add getRecentParsed, _parseProtobufLogs |
| `types/index.d.ts` | Add type declarations for all new methods |
| `test/lib/MediumPriorityFixTests.js` | NEW — 18 unit tests |
| `test/lib/ApiMigrationTests.js` | Add URL validation tests |
| `package.json` | Update test:unit to include MediumPriorityFixTests.js |

---

## Documentation Updates

### CHANGELOG.md

Add v1.0.8 section:

```markdown
## Version 1.0.8 2026-03-05

**PATCH RELEASE — 6 MEDIUM Priority Fixes**

Resolves all remaining MEDIUM priority issues from upstream repositories.

### Enhancements

- **M1 — ServiceInstances:** Added `startInstance()` and `stopInstance()` for HANA Cloud DB lifecycle management
- **M2 — CloudControllerBase:** Added URL validation in constructor and `setEndPoint()` — rejects invalid URLs with descriptive errors
- **M3 — UsersUAA:** Added `loginWithApiKey()` for IBM Cloud API Key auth and `loginWithClientCredentials()` for OAuth2 client credentials
- **M4 — ServiceInstances:** Added `getInstancesBySpace()` and `getInstanceByNameInSpace()` for space-scoped queries (fixes same-name services in different spaces)
- **M5 — UsersUAA:** Added `getTokenInfo()` for JWT token decoding and `checkToken()` for server-side validation
- **M6 — Logs:** Added `getRecentParsed()` for structured log entries with timestamp parsing

### Tests
- 18 new unit tests covering all MEDIUM fixes
- All **157 tests passing**, 0 failing

### TypeScript
- Added type declarations for all new methods
- New `TokenInfo` and `LogEntry` interfaces
```

### README.md

Move all 6 issues from "Open / In Progress" to "✅ Resolved in This Fork".

---

## Success Criteria

- [ ] All 6 MEDIUM priority issues implemented
- [ ] All 18 new tests passing
- [ ] TypeScript declarations added
- [ ] Documentation updated (CHANGELOG, README)
- [ ] `npm run precheck` passes (lint + tests + tsc)
- [ ] No breaking changes to existing API

---

## Timeline

**Estimated effort:** 4-6 hours  
**Target completion:** March 5, 2026

---

## Next Steps After Completion

1. Update issue tracker docs to mark M1-M6 as RESOLVED
2. Bump version to 1.0.8 in package.json
3. Run full test suite
4. Commit and push
5. Create GitHub release with tag v1.0.8
6. Publish to npm
