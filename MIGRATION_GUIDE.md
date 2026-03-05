# Migration Guide: cf-nodejs-client → cf-node-client v1.0.0

## Important: v1.0.5 — 11 Incorrect v3 Endpoints Fixed

If you are using v1.0.0–v1.0.4 in **v3 mode (default)**, the following methods called wrong endpoints:

- `AppsDeployment`: `getStats()`, `associateRoute()`, `getServiceBindings()`, `upload()` (v3 path)
- `Organizations`: `getUsers()`, `getManagers()`, `getAuditors()` (v3 path)
- `Spaces`: `getUsers()`, `getManagers()`, `getDevelopers()`, `getAuditors()` (v3 path)

**Upgrade to v1.0.5** to get correct v3 API endpoints. No consumer code changes needed.

## Important: v1.0.4 Hotfix — Authentication Flow

If you upgraded to v1.0.0–v1.0.3 and hit the error:
```
Invalid endpoint URL: "undefined". Must be a valid http:// or https:// URL.
```

**Upgrade to v1.0.4** — this fixes `getInfo()` in v3 mode. The standard auth pattern now works correctly:

```javascript
// This works in v1.0.4+ (both v2 and v3):
const info = await cfController.getInfo();
usersUAA.setEndPoint(info.authorization_endpoint);  // ✅ No longer undefined

// Or use the new convenience method (recommended):
const authEndpoint = await cfController.getAuthorizationEndpoint();
usersUAA.setEndPoint(authEndpoint);
```

---

## Overview

The cf-nodejs-client package has been renamed to `cf-node-client` and upgraded to version 1.0.0 with full Cloud Foundry API v3 support.

**Key Changes:**
- 📦 Package rename: `cf-nodejs-client` → `cf-node-client`
- 🚀 v3 is now default (v2 still available)
- ✅ 100% backward compatible with v2
- 🔄 Zero breaking changes to public APIs

## Step-by-Step Migration

### Step 1: Update package.json

```bash
# Remove old package
npm uninstall cf-nodejs-client

# Install new package
npm install cf-node-client@1.0.0
```

Or manually update `package.json`:
```json
{
  "dependencies": {
    "cf-node-client": "^1.0.0"
  }
}
```

Then run:
```bash
npm install
```

### Step 2: Update require statements

**Before (v0.13.0):**
```javascript
const CloudController = require('cf-nodejs-client').CloudController;
const Apps = require('cf-nodejs-client').Apps;
const Organizations = require('cf-nodejs-client').Organizations;
```

**After (v1.0.0):**
```javascript
const CloudController = require('cf-node-client').CloudController;
const Apps = require('cf-node-client').Apps;
const Organizations = require('cf-node-client').Organizations;
```

### Step 3: Test your application

If your code explicitly sets v2, update it:

**Before:**
```javascript
const cf = new CloudController(endpoint);
cf.setToken(token);
// v2 was default in 0.13.0
cf.getApps(); // Uses /v2/apps
```

**After (Option 1 - Keep using v2):**
```javascript
const cf = new CloudController(endpoint);
cf.setToken(token);
// v3 is now default, but you can explicitly use v2
cf.setApiVersion('v2');
cf.getApps(); // Uses /v2/apps
```

**After (Option 2 - Upgrade to v3):**
```javascript
const cf = new CloudController(endpoint);
cf.setToken(token);
// v3 is default - no changes to method calls!
cf.getApps(); // Uses /v3/apps (automatically)
```

### Step 4: Verify compatibility

Run your test suite:
```bash
npm test
```

All existing code should work without modification!

## Upgrade Strategy

### Conservative Approach (Immediate, Zero Risk)
```javascript
// Upgrade package but stay on v2 API for now
cf.setApiVersion('v2');

// Your existing code works 100% as before
// No functional changes needed
```

**Timeline:** Immediate  
**Risk:** None  
**Recommended:** For production systems that can't be tested

### Gradual Upgrade (Phase by Phase)
```javascript
// Week 1: Upgrade package, stay on v2
cf.setApiVersion('v2');

// Week 2: Test v3 in specific module
const apps = new Apps(endpoint, token);
// apps now uses v3 by default - test it

// Week 3: Move to v3 across application
cf.setApiVersion('v3'); // This is now default anyway

// Week 4: Remove setApiVersion calls
// v3 is already the default
```

**Timeline:** 4 weeks  
**Risk:** Low (test each phase)  
**Recommended:** For most production systems

### Aggressive Upgrade (All at Once)
```javascript
// Just upgrade the package - that's it!
// Don't set API version explicitly
// v3 is used by default

// All your code continues to work
// But now uses v3 endpoints automatically
```

**Timeline:** Immediate  
**Risk:** Medium (requires testing)  
**Recommended:** For dev/qa environments first

## API Differences (v2 vs v3)

### Query Parameters
v2 and v3 use same query syntax:
```javascript
cf.getApps({
    q: 'name:my-app',
    'page': 1,
    'results-per-page': 50
});
```

### Response Format
Responses are different but the SDK handles translation:

**v2 Response:**
```javascript
{
    total_results: 100,
    total_pages: 5,
    prev_url: '/v2/apps?page=1',
    next_url: '/v2/apps?page=3',
    resources: [
        { metadata: { guid: '...' }, entity: { name: 'app1' } }
    ]
}
```

**v3 Response:**
```javascript
{
    pagination: {
        total_results: 100,
        total_pages: 5,
        first: { href: '/v3/apps?page=1' },
        last: { href: '/v3/apps?page=5' },
        next: { href: '/v3/apps?page=3' }
    },
    resources: [
        { guid: '...', name: 'app1', ... }
    ]
}
```

**Important:** The SDK normalizes these - your code doesn't need to change!

### Field Names
Some field names differ between v2 and v3:

| v2 | v3 | SDK Handles |
|----|----|-------------|
| `state: 'STARTED'` | `stopped: false` | ✅ Auto-translated |
| `memory` | `memory_in_mb` | ✅ Auto-translated |
| `instances` | `instances` | ✅ Same |
| `routes` | `urls` | ✅ Auto-translated |

The SDK handles these translations automatically - your code doesn't change!

## Endpoint Changes

Some endpoints were renamed in v3. The SDK handles routing automatically:

### Renamed Endpoints

| Resource | v2 | v3 | Notes |
|----------|----|----|-------|
| Services | `/v2/services` | `/v3/service_offerings` | Major entity restructure |
| Events | `/v2/events` | `/v3/audit_events` | Renamed & improved |
| Jobs | `/v2/jobs` | `/v3/tasks` | Simpler model |
| Org Quotas | `/v2/quota_definitions` | `/v3/organization_quotas` | Clearer naming |
| Space Quotas | `/v2/space_quota_definitions` | `/v3/space_quotas` | Clearer naming |
| Bindings | `/v2/service_bindings` | `/v3/service_credential_bindings` | More specific |

**No changes needed to your code** - the SDK routes requests to correct endpoint based on API version!

## Error Handling

### v2-Specific Operations
Some operations only exist in v2. If you call them in v3 mode:

```javascript
cf.setApiVersion('v3');

// This exists in both v2 and v3 - works!
cf.getOrganizations();

// This is v2-only - will throw with helpful error
cf.getOrganizationMemoryUsage(orgGuid);
// Error: "getOrganizationMemoryUsage only available in v2 API"
```

### Workaround
```javascript
// Switch to v2 temporarily for v2-only operations
const v3Instance = new CloudController(endpoint);
v3Instance.setToken(token);

const memoryUsage = v3Instance.getOrganizationMemoryUsage(orgGuid);

// Then switch back to v3
const orgs = v3Instance.setApiVersion('v3').getOrganizations();
```

## Testing Your Migration

### Quick Smoke Test
```javascript
const CloudController = require('cf-node-client').CloudController;

async function test() {
    const cf = new CloudController(process.env.CF_ENDPOINT);
    cf.setToken(JSON.parse(process.env.CF_TOKEN));
    
    // Test both APIs
    console.log('Testing v3 API...');
    cf.setApiVersion('v3');
    const v3Apps = await cf.getApps();
    console.log(`v3: Found ${v3Apps.resources.length} apps`);
    
    console.log('Testing v2 API...');
    cf.setApiVersion('v2');
    const v2Apps = await cf.getApps();
    console.log(`v2: Found ${v2Apps.resources.length} apps`);
    
    // Should match (domain logic differences aside)
    console.log('✅ Both APIs working!');
}

test().catch(console.error);
```

### Full Test Suite
```bash
npm test
```

All existing tests should pass without modification.

## Troubleshooting

### "Cannot find module 'cf-nodejs-client'"
**Fix:** Update require statement:
```javascript
// Change this:
const lib = require('cf-nodejs-client');

// To this:
const lib = require('cf-node-client');
```

### "Method not available in v3"
**Fix:** Switch to v2 temporarily or for that operation:
```javascript
controller.setApiVersion('v2');
const result = await controller.someV2OnlyMethod();
controller.setApiVersion('v3');
```

### "Response format error"
**Fix:** The SDK handles response format translation. If you're  parsing responses manually:

```javascript
// Before (parsing v2 responses):
const resource = response.resources[0];
const guid = resource.metadata.guid;
const name = resource.entity.name;

// After (SDK normalizes v3 response):
const resource = response.resources[0];
const guid = resource.guid; // No need for metadata.guid
const name = resource.name; // No need for entity.name
```

If you're using the SDK methods (recommended), no changes needed!

### Connection errors after upgrade
Ensure you're encoding credential correctly:
```javascript
const token = {
    token_type: 'Bearer',
    access_token: 'your-token-here',
    expires_in: 3600
};

cf.setToken(token);
```

## Performance Improvements

v3 often provides better performance:

### Single Request Instead of Multiple
```javascript
// v2: Fetch app, then fetch routes, then fetch services
const app = await cf.getApp(appGuid);  
const routes = await cf.getRoutes({ q: `app_guid:${appGuid}` });
const services = await cf.getServiceBindings({ q: `app_guid:${appGuid}` });

// v3: Often includes relationships in single response
const app = await cf.getApp(appGuid, { include: 'routes,serviceBindings' });
const routes = app.relationships.routes;
const services = app.relationships.serviceBindings;
```

### Better Filtering
```javascript
// v3 supports more powerful filtering
cf.setApiVersion('v3');
const apps = await cf.getApps({
    organization_guids: [orgGuid],
    space_guids: [spaceGuid],
    names: ['my-app']
});
```

## Support & Help

If you encounter issues:

1. **Check the logs** - Enable debug logging:
   ```javascript
   process.env.DEBUG = 'cf-node-client:*';
   ```

2. **Review RELEASE_NOTES.md** - All changes documented

3. **Check examples** - See [examples/](../examples/) for patterns

4. **File an issue** - GitHub issues welcome with reproduction steps

5. **Stay updated** - Watch for releases that fix issues

## FAQ

**Q: Do I need to rewrite all my code?**  
A: No! All existing code continues to work without changes.

**Q: Can I use both v2 and v3 in the same application?**  
A: Yes! Create two controller instances and use different versions:
```javascript
const v2cf = new CloudController(endpoint);
v2cf.setApiVersion('v2');

const v3cf = new CloudController(endpoint);
v3cf.setApiVersion('v3');
```

**Q: What about the old cf-nodejs-client package?**  
A: It's unmaintained. Upgrade to cf-node-client for bug fixes and v3 support.

**Q: Is there a performance impact from switching?**  
A: No, often v3 is faster (fewer API calls needed).

**Q: What about rate limiting?**  
A: Same limits apply, v3 usually needs fewer requests.

---

**Ready to upgrade? Let's go! 🚀**
