# Usage Guide

This guide provides sample usage for key components of the Cloud Foundry Node.js client, including Apps, Organizations, Spaces, ServiceInstances, and the convenience methods.

## Authentication

All API calls require an OAuth token from UAA.

```js
const { CloudController, UsersUAA } = require('cf-node-client');

const cfController = new CloudController('https://api.cf.example.com');
const usersUAA = new UsersUAA();

const info = await cfController.getInfo();
usersUAA.setEndPoint(info.authorization_endpoint);
const token = await usersUAA.login('username', 'password');
```

## Organizations

```js
const { Organizations } = require('cf-node-client');
const orgsClient = new Organizations('https://api.cf.example.com');
orgsClient.setToken(token);

// List all organizations
const orgs = await orgsClient.getOrganizations();

// Get organization by GUID
const org = await orgsClient.getOrganization('org-guid-here');

// Find organization by name (server-side filter — single API call)
const org = await orgsClient.getOrganizationByName('my-org');
// Returns first match or null
```

## Spaces

```js
const { Spaces } = require('cf-node-client');
const spacesClient = new Spaces('https://api.cf.example.com');
spacesClient.setToken(token);

// List all spaces
const spaces = await spacesClient.getSpaces();

// Get space by GUID
const space = await spacesClient.getSpace('space-guid-here');

// Find space by name (optionally scoped to an organization)
const space = await spacesClient.getSpaceByName('dev');
const space = await spacesClient.getSpaceByName('dev', orgGuid); // recommended
// Returns first match or null
```

## Apps

```js
const { Apps } = require('cf-node-client');
const appsClient = new Apps('https://api.cf.example.com');
appsClient.setToken(token);

// List all apps
const apps = await appsClient.getApps();

// Get app by GUID
const app = await appsClient.getApp('app-guid-here');

// Find app by name (optionally scoped to a space)
const app = await appsClient.getAppByName('my-app');
const app = await appsClient.getAppByName('my-app', spaceGuid); // recommended
// Returns first match or null

// Lifecycle operations
await appsClient.start(appGuid);
await appsClient.stop(appGuid);
await appsClient.restart(appGuid);
```

## Service Instances

```js
const { ServiceInstances } = require('cf-node-client');
const siClient = new ServiceInstances('https://api.cf.example.com');
siClient.setToken(token);

// List all service instances
const instances = await siClient.getInstances();

// Get service instance by GUID
const instance = await siClient.getInstance('instance-guid-here');

// Find service instance by name (optionally scoped to a space)
const instance = await siClient.getInstanceByName('my-database');
const instance = await siClient.getInstanceByName('my-database', spaceGuid); // recommended
// Returns first match or null
```

## Convenience Methods Summary

| Resource         | List All              | Get by GUID              | Find by Name                              | Get ALL (paginated)          |
| ---------------- | --------------------- | ------------------------ | ----------------------------------------- | ---------------------------- |
| Organizations    | `getOrganizations()`  | `getOrganization(guid)`  | `getOrganizationByName(name)`             | `getAllOrganizations(filter?)`|
| Spaces           | `getSpaces()`         | `getSpace(guid)`         | `getSpaceByName(name, orgGuid?)`          | `getAllSpaces(filter?)`      |
| Apps             | `getApps()`           | `getApp(guid)`           | `getAppByName(name, spaceGuid?)`          | `getAllApps(filter?)`        |
| ServiceInstances | `getInstances()`      | `getInstance(guid)`      | `getInstanceByName(name, spaceGuid?)`     | `getAllInstances(filter?)`   |

> **Find by Name** methods use server-side filtering (`q=name:X` for v2, `names=X` for v3) — much more efficient than fetching all resources and filtering client-side.

> **Get ALL (paginated)** methods auto-paginate through every page and return a flat array of all resources. Handles both v2 (`next_url`) and v3 (`pagination.next`) pagination transparently.

## Auto-Pagination

The library handles pagination automatically so you don't have to write manual loops:

```js
// Before — manual pagination loop
let allOrgs = [], page = 1, hasMore = true;
while (hasMore) {
    const res = await orgsClient.getOrganizations({ page });
    allOrgs = allOrgs.concat(res.resources);
    hasMore = !!res.next_url;
    page++;
}

// After — one call
const allOrgs = await orgsClient.getAllOrganizations();
const allSpaces = await spacesClient.getAllSpaces();
const allApps = await appsClient.getAllApps({ q: 'space_guid:xxx' });
const allSIs = await siClient.getAllInstances();
```

Works with both v2 and v3 APIs. The v3 variant fetches 200 per page; v2 fetches 100 per page.

## Memory Cache

An opt-in, in-memory cache reduces redundant API calls. Cache entries expire after a configurable TTL (default 30 s).

```js
// Enable via constructor
const orgs = new Organizations(api, { cache: true, cacheTTL: 60000 });
orgs.setToken(token);

const first = await orgs.getAllOrganizations();  // API call → cached
const second = await orgs.getAllOrganizations(); // cache hit — 0 HTTP calls

// Or toggle at runtime
orgs.enableCache();      // default 30 s TTL
orgs.enableCache(60000); // custom TTL
orgs.clearCache();       // clear entries, keep cache on
orgs.disableCache();     // off + clear
```

## Full Workflow Example

```js
// Org → Space → App → Start
const org = await orgsClient.getOrganizationByName('my-org');
const orgGuid = org.metadata ? org.metadata.guid : org.guid;

const space = await spacesClient.getSpaceByName('dev', orgGuid);
const spaceGuid = space.metadata ? space.metadata.guid : space.guid;

const app = await appsClient.getAppByName('my-app', spaceGuid);
const appGuid = app.metadata ? app.metadata.guid : app.guid;

await appsClient.start(appGuid);
console.log('App started!');
```

## Service Layer Usage (CloudFoundryService)

See [cf.service.js](../ref/cf.service.js) for the high-level wrapper that orchestrates authentication + lookup + actions.

```js
const cfService = require('./ref/cf.service');
const appDetails = {
  apiCF: 'https://api.cf.example.com',
  credentials: { username: 'user', password: 'pass' },
  orgName: 'my-org',
  orgId: 'org-guid',
  space: 'my-space'
};
await cfService.executeAction('START_APP', 'app-guid', appDetails, '[LOG]', 'my-app');
```

---
For advanced usage and orchestration, see the [SystemArchitecture.md](SystemArchitecture.md) and [cf-service-usage-example.js](../examples/cf-service-usage-example.js).
