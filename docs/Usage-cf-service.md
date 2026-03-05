# CloudFoundryService Usage & API

This document provides professional sample usage and API documentation for the `CloudFoundryService` class (see [ref/cf.service.js](../ref/cf.service.js)).

## Overview
`CloudFoundryService` orchestrates Cloud Foundry API calls, caching, error handling, and provides high-level methods for app management.

## Main Methods
- `executeAction(action, appGuid, appDetails, logPrefix, appName)`
- `getAuthenticatedApps(appDetails)`
- `getCfAuthToken(apiCF, credentials)`
- `getOrg(subOrgs, orgData)`
- `getSpaceByName(devSpaces, org, spaceName)`
- `getAllResources(fetchFunction)`

## Sample Usage
```js
const cfService = require('./ref/cf.service');
const appDetails = {
  apiCF: 'https://api.cf.example.com',
  credentials: { username: 'user', password: 'pass' },
  orgName: 'my-org',
  orgId: 'org-guid',
  space: 'my-space'
};

// Start an app
await cfService.executeAction('START_APP', 'app-guid', appDetails, '[LOG]', 'my-app');

// Stop an app
await cfService.executeAction('STOP_APP', 'app-guid', appDetails, '[LOG]', 'my-app');

// Update an app
await cfService.executeAction('UPDATE_APP', 'app-guid', appDetails, '[LOG]', 'my-app');

// Get all apps in a space
const apps = await cfService.getAuthenticatedApps(appDetails);

// Error handling example
try {
  await cfService.executeAction('START_APP', 'bad-guid', appDetails, '[LOG]', 'bad-app');
} catch (err) {
  console.error('CF Error:', err.message);
}
```

## Using Low-Level Convenience Methods Instead

For lightweight scripts that don't need the full `CloudFoundryService` orchestration layer, use the convenience methods on individual resource clients directly:

```js
const { Organizations, Spaces, Apps, ServiceInstances } = require('cf-node-client');

const orgsClient = new Organizations(apiCF);
const spacesClient = new Spaces(apiCF);
const appsClient = new Apps(apiCF);
const siClient = new ServiceInstances(apiCF);

orgsClient.setToken(token);
spacesClient.setToken(token);
appsClient.setToken(token);
siClient.setToken(token);

// Find by name (server-side filter — single API call, returns first match or null)
const org = await orgsClient.getOrganizationByName('my-org');
const space = await spacesClient.getSpaceByName('dev', orgGuid);
const app = await appsClient.getAppByName('my-app', spaceGuid);
const instance = await siClient.getInstanceByName('my-database', spaceGuid);

// Get by GUID (direct lookup)
const org = await orgsClient.getOrganization('org-guid');
const space = await spacesClient.getSpace('space-guid');
const app = await appsClient.getApp('app-guid');
const instance = await siClient.getInstance('instance-guid');

// Auto-paginate — Get ALL resources across every page
const allOrgs = await orgsClient.getAllOrganizations();
const allSpaces = await spacesClient.getAllSpaces();
const allApps = await appsClient.getAllApps({ q: 'space_guid:xxx' });
const allInstances = await siClient.getAllInstances();

// Memory cache (opt-in, reduces redundant API calls)
const cachedOrgs = new Organizations(api, { cache: true, cacheTTL: 60000 });
cachedOrgs.setToken(token);
await cachedOrgs.getAllOrganizations(); // API call → cached
await cachedOrgs.getAllOrganizations(); // cache hit, 0 HTTP calls
```

> **Note:** `getAllResources(fetchFn)` from `cf.service.js` is now built into the library as `getAllOrganizations()`, `getAllSpaces()`, `getAllApps()`, and `getAllInstances()`. You no longer need to implement your own pagination loop.

> See [Usage.md](Usage.md) for full API reference and [cf-service-usage-example.js](../examples/cf-service-usage-example.js) for a comprehensive example file.

## API Reference
See inline JSDoc in [cf.service.js](../ref/cf.service.js) for details on each method.

---
For architecture and code patterns, see [SystemArchitecture.md](SystemArchitecture.md).
