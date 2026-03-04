# Usage Guide

This guide provides sample usage for key components of the Cloud Foundry Node.js client, including Apps, Organizations, Spaces, and the main service layer.

## 1. Apps Usage
```js
const { Apps } = require('cf-node-client');
const appsClient = new Apps('https://api.cf.example.com');
appsClient.setToken('your-access-token');
const apps = await appsClient.getApps();
```

## 2. Organizations Usage
```js
const { Organizations } = require('cf-node-client');
const orgsClient = new Organizations('https://api.cf.example.com');
orgsClient.setToken('your-access-token');
const orgs = await orgsClient.getOrganizations();
```

## 3. Spaces Usage
```js
const { Spaces } = require('cf-node-client');
const spacesClient = new Spaces('https://api.cf.example.com');
spacesClient.setToken('your-access-token');
const spaces = await spacesClient.getSpaces();
```

## 4. Service Layer Usage (CloudFoundryService)
See [cf.service.js](../ref/cf.service.js) for full implementation.

### Sample: Start/Stop/Update App
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

### Sample: Get Authenticated Apps
```js
const apps = await cfService.getAuthenticatedApps(appDetails);
```

---
For advanced usage and orchestration, see the [SystemArchitecture.md](SystemArchitecture.md) and service implementation.
