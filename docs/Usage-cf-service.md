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

## API Reference
See inline JSDoc in [cf.service.js](../ref/cf.service.js) for details on each method.

---
For architecture and code patterns, see [SystemArchitecture.md](SystemArchitecture.md).
