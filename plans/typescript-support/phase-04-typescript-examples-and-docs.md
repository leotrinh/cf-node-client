# Phase 4: TypeScript Examples & Documentation

**Duration**: 1-2 hours | **Priority**: HIGH | **Status**: DOCUMENTATION

## Context

Add comprehensive TypeScript examples and update documentation to guide TypeScript users. Examples demonstrate best practices and common patterns.

## Objectives

1. ✅ Create TypeScript usage example file
2. ✅ Create TypeScript React/integration examples
3. ✅ Update README with TypeScript setup instructions
4. ✅ Create TypeScript API reference documentation

## Implementation Steps

### Step 4.1: Create Basic TypeScript Example

**File**: `examples/typescript-usage.ts` (NEW)

```typescript
/**
 * TypeScript Usage Example - cf-node-client
 * 
 * This example demonstrates how to use cf-node-client with TypeScript
 */

import {
  CloudFoundryClient,
  OAuthToken,
  Apps,
  Spaces,
  Organizations,
  CreateAppOptions,
  CreateSpaceOptions
} from 'cf-node-client';

/**
 * Initialize the CloudFoundry client with TypeScript
 */
async function initializeClient(): Promise<CloudFoundryClient> {
  // Client configuration
  const config = {
    endpoint: 'https://api.cloudfoundry.example.com',
    apiVersion: 'v3' as const, // Explicitly typed
    logEndpoint: 'https://logs.cloudfoundry.example.com',
    uaaEndpoint: 'https://uaa.cloudfoundry.example.com'
  };

  // Create client instance with proper typing
  const client = new CloudFoundryClient(config);

  return client;
}

/**
 * Authenticate and set token
 */
async function authenticateWithUAA(
  client: CloudFoundryClient,
  username: string,
  password: string
): Promise<void> {
  // In real usage, authenticate with UAA to get a token
  const token: OAuthToken = {
    token_type: 'Bearer',
    access_token: 'your-oauth-token-here',
    refresh_token: 'optional-refresh-token',
    expires_in: 3600
  };

  client.setToken(token);
}

/**
 * List all applications with typing
 */
async function listApplications(client: CloudFoundryClient): Promise<void> {
  try {
    const apps = client.apps;
    
    // Get all apps with proper response typing
    const response = await apps.getApps({
      page: 1,
      per_page: 50
    });

    console.log(`Total apps: ${response.total_results || 0}`);
    
    // Response resources are properly typed
    response.resources?.forEach(app => {
      console.log(`App: ${app.name} (GUID: ${app.guid})`);
      console.log(`  State: ${app.state}`);
      console.log(`  Memory: ${app.memory}MB`);
      console.log(`  Instances: ${app.instances}`);
    });
  } catch (error) {
    console.error('Error listing applications:', error);
    throw error;
  }
}

/**
 * Create a new application with type safety
 */
async function createApplication(
  client: CloudFoundryClient,
  appName: string,
  spaceGuid: string
): Promise<string> {
  try {
    const appOptions: CreateAppOptions = {
      name: appName,
      space_guid: spaceGuid,
      buildpack: 'nodejs_buildpack',
      memory: 512,
      instances: 1,
      disk_quota: 1024,
      environment_json: {
        NODE_ENV: 'production',
        LOG_LEVEL: 'info'
      }
    };

    const createdApp = await client.apps.create(appOptions);
    console.log(`Application created: ${createdApp.name} (${createdApp.guid})`);
    
    return createdApp.guid;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

/**
 * List spaces in an organization
 */
async function listSpaces(
  client: CloudFoundryClient,
  orgGuid: string
): Promise<void> {
  try {
    const response = await client.spaces.getSpaces({
      page: 1,
      per_page: 100
    });

    console.log(`Spaces in organization:`);
    response.resources?.forEach(space => {
      console.log(`  - ${space.name} (${space.guid})`);
      console.log(`    Organization: ${space.organization_guid}`);
    });
  } catch (error) {
    console.error('Error listing spaces:', error);
    throw error;
  }
}

/**
 * Get application statistics
 */
async function getApplicationStats(
  client: CloudFoundryClient,
  appGuid: string
): Promise<void> {
  try {
    const stats = await client.apps.getStats(appGuid);
    
    console.log('Application Statistics:');
    Object.entries(stats).forEach(([instance, data]: [string, any]) => {
      console.log(`  Instance ${instance}:`);
      console.log(`    CPU: ${(data.stats?.cpu || 0).toFixed(2)}%`);
      console.log(`    Memory: ${((data.stats?.mem || 0) / 1024 / 1024).toFixed(2)}MB`);
      console.log(`    Disk: ${((data.stats?.disk || 0) / 1024 / 1024).toFixed(2)}MB`);
    });
  } catch (error) {
    console.error('Error getting app stats:', error);
    throw error;
  }
}

/**
 * Manage service instances
 */
async function manageServices(client: CloudFoundryClient): Promise<void> {
  try {
    // List services
    const servicesResponse = await client.services.getServices();
    console.log(`Available services: ${servicesResponse.total_results}`);

    // List service instances
    const instancesResponse = await client.serviceInstances.getServiceInstances();
    console.log(`Service instances: ${instancesResponse.total_results}`);

    instancesResponse.resources?.forEach(instance => {
      console.log(`  - ${instance.name} (${instance.type})`);
      console.log(`    Tags: ${instance.tags?.join(', ') || 'none'}`);
    });
  } catch (error) {
    console.error('Error managing services:', error);
    throw error;
  }
}

/**
 * Main execution with proper error handling
 */
async function main(): Promise<void> {
  let client: CloudFoundryClient | null = null;

  try {
    // Initialize client
    console.log('Initializing CloudFoundry client...');
    client = await initializeClient();

    // Authenticate
    console.log('Authenticating with UAA...');
    await authenticateWithUAA(client, 'username', 'password');

    // List applications
    console.log('\n--- Listing Applications ---');
    await listApplications(client);

    // List spaces
    console.log('\n--- Listing Spaces ---');
    await listSpaces(client, 'org-guid-here');

    // Create application
    console.log('\n--- Creating Application ---');
    const newAppGuid = await createApplication(
      client,
      'my-typescript-app',
      'space-guid-here'
    );

    // Get app stats
    console.log('\n--- Application Statistics ---');
    await getApplicationStats(client, newAppGuid);

    // Manage services
    console.log('\n--- Managing Services ---');
    await manageServices(client);

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
});
```

---

### Step 4.2: Create Advanced TypeScript Example

**File**: `examples/typescript-advanced.ts` (NEW)

```typescript
/**
 * Advanced TypeScript Example - cf-node-client
 * 
 * Demonstrates advanced patterns and error handling
 */

import {
  CloudFoundryClient,
  OAuthToken,
  CloudFoundryResponse,
  ListResourceParams,
  AppEntity
} from 'cf-node-client';

/**
 * Retry policy for API calls
 */
interface RetryPolicy {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

/**
 * Execute API call with retry logic
 */
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  policy: RetryPolicy = {
    maxRetries: 3,
    delayMs: 1000,
    backoffMultiplier: 2
  }
): Promise<T> {
  let lastError: Error | null = null;
  let delay = policy.delayMs;

  for (let attempt = 0; attempt < policy.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
      
      // Don't retry on certain errors (e.g., 401 unauthorized)
      if (error instanceof Error && error.message.includes('401')) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= policy.backoffMultiplier;
    }
  }

  throw lastError || new Error('Unknown error');
}

/**
 * Paginate through all resources
 */
async function* paginateResources<T>(
  getPage: (params: ListResourceParams) => Promise<CloudFoundryResponse<T>>,
  pageSize: number = 50
): AsyncGenerator<T> {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await getPage({
      page,
      per_page: pageSize
    });

    for (const resource of response.resources || []) {
      yield resource;
    }

    // Check if there are more pages
    hasMore = (response.total_pages || 1) > page;
    page++;
  }
}

/**
 * Find application by partial name match
 */
async function findApplicationByName(
  client: CloudFoundryClient,
  partialName: string
): Promise<AppEntity | null> {
  try {
    // Using retry with exponential backoff
    const result = await executeWithRetry(async () => {
      for await (const app of paginateResources(
        params => client.apps.getApps(params)
      )) {
        if (app.name.toLowerCase().includes(partialName.toLowerCase())) {
          return app;
        }
      }
      return null;
    });

    return result;
  } catch (error) {
    console.error('Error finding application:', error);
    throw error;
  }
}

/**
 * Batch operations with concurrency control
 */
async function batchStartApplications(
  client: CloudFoundryClient,
  appGuids: string[],
  concurrency: number = 3
): Promise<{ success: string[]; failed: string[] }> {
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  // Process in batches
  for (let i = 0; i < appGuids.length; i += concurrency) {
    const batch = appGuids.slice(i, i + concurrency);
    
    const promises = batch.map(guid =>
      client.apps.start(guid)
        .then(() => {
          results.success.push(guid);
          return guid;
        })
        .catch(error => {
          console.error(`Failed to start app ${guid}:`, error);
          results.failed.push(guid);
          return null;
        })
    );

    await Promise.all(promises);
  }

  return results;
}

/**
 * Monitor application instance health
 */
async function monitorAppHealth(
  client: CloudFoundryClient,
  appGuid: string,
  intervalMs: number = 5000,
  maxChecks: number = 10
): Promise<void> {
  let healthy = true;
  let checks = 0;

  while (healthy && checks < maxChecks) {
    try {
      const app = await client.apps.getApp(appGuid);
      const instances = await client.apps.getInstances(appGuid);

      const instanceCount = Object.keys(instances).length;
      console.log(`App ${app.name}: State=${app.state}, Instances=${instanceCount}`);

      // Check instance health
      Object.entries(instances).forEach(([index, instance]: [string, any]) => {
        const state = instance.state;
        console.log(`  Instance ${index}: ${state}`);
        
        if (state !== 'RUNNING') {
          healthy = false;
        }
      });

      checks++;
      if (healthy && checks < maxChecks) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error('Error monitoring app health:', error);
      break;
    }
  }
}

/**
 * Generate application summary report
 */
async function generateAppReport(
  client: CloudFoundryClient,
  spaceGuid: string
): Promise<string> {
  const report: string[] = [];
  report.push('=== Application Summary Report ===');
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push('');

  try {
    const appsResponse = await client.apps.getApps({ page: 1, per_page: 100 });
    
    const summary = {
      totalApps: appsResponse.total_results || 0,
      running: 0,
      stopped: 0,
      totalMemory: 0,
      totalInstances: 0
    };

    for (const app of appsResponse.resources || []) {
      if (app.state === 'STARTED') {
        summary.running++;
      } else if (app.state === 'STOPPED') {
        summary.stopped++;
      }
      summary.totalMemory += app.memory || 0;
      summary.totalInstances += app.instances || 0;
    }

    report.push(`Total Applications: ${summary.totalApps}`);
    report.push(`Running: ${summary.running}`);
    report.push(`Stopped: ${summary.stopped}`);
    report.push(`Total Memory Allocated: ${summary.totalMemory}MB`);
    report.push(`Total Instances: ${summary.totalInstances}`);

  } catch (error) {
    report.push(`Error generating report: ${error}`);
  }

  return report.join('\n');
}

// Export functions for use
export {
  executeWithRetry,
  paginateResources,
  findApplicationByName,
  batchStartApplications,
  monitorAppHealth,
  generateAppReport
};
```

---

### Step 4.3: Update README with TypeScript Section

**File**: `README.md`

Add a new section after "Getting Started":

```markdown
## TypeScript Support

This package includes full TypeScript type definitions. You can use cf-node-client in TypeScript projects with complete type safety and IDE IntelliSense support.

### Getting Started with TypeScript

```bash
npm install cf-node-client typescript
```

### TypeScript Configuration

The package includes `types/index.d.ts` which provides complete type definitions. Configure your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

### Basic TypeScript Example

```typescript
import {
  CloudFoundryClient,
  OAuthToken,
  CreateAppOptions
} from 'cf-node-client';

// Initialize client
const client = new CloudFoundryClient({
  endpoint: 'https://api.cloudfoundry.example.com',
  apiVersion: 'v3'
});

// Set authentication token
const token: OAuthToken = {
  token_type: 'Bearer',
  access_token: 'your-token-here'
};
client.setToken(token);

// List applications with full type safety
async function listApps() {
  const response = await client.apps.getApps();
  
  response.resources?.forEach(app => {
    console.log(`${app.name}: ${app.state}`);
  });
}

listApps();
```

### Available Types

All Cloud Foundry API entities and options are fully typed:

- **Cloud Controller Models**: `Apps`, `Spaces`, `Organizations`, `Routes`, `Services`, `ServiceInstances`, etc.
- **Entity Types**: `AppEntity`, `SpaceEntity`, `OrganizationEntity`, etc.
- **Option Types**: `CreateAppOptions`, `CreateSpaceOptions`, `ListResourceParams`, etc.
- **Utilities**: `HttpStatus`, `HttpMethods`, `HttpUtils`
- **Authentication**: `OAuthToken`, `UAAUser`

See [TypeScript Examples](./examples/) for more usage patterns.

### Type Checking

You can enable strict type checking even for JavaScript:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "noEmit": true
  }
}
```

Then run: `npm run type-check`
```

---

### Step 4.4: Create TypeScript API Reference

**File**: `docs/TypeScript-API-Reference.md` (NEW)

```markdown
# TypeScript API Reference for cf-node-client

## Overview

This document provides a comprehensive reference for using cf-node-client with TypeScript.

## Main Classes

### CloudFoundryClient

Main client class for interacting with Cloud Foundry

```typescript
class CloudFoundryClient {
  constructor(options: CFClientOptions);
  setToken(token: OAuthToken): void;
  
  // Cloud Controller services
  apps: Apps;
  buildPacks: BuildPacks;
  domains: Domains;
  organizations: Organizations;
  routes: Routes;
  services: Services;
  serviceInstances: ServiceInstances;
  serviceBindings: ServiceBindings;
  spaces: Spaces;
  stacks: Stacks;
  users: Users;
  
  // Metrics
  logs: Logs;
  
  // UAA
  usersUAA: UsersUAA;
}
```

### Apps

Manage Cloud Foundry applications

```typescript
class Apps extends CloudControllerBase {
  getApps(filter?: ListResourceParams): Promise<CloudFoundryResponse<AppEntity>>;
  getApp(appGuid: string): Promise<AppEntity>;
  create(appOptions: CreateAppOptions): Promise<AppEntity>;
  update(appGuid: string, options: UpdateAppOptions): Promise<AppEntity>;
  delete(appGuid: string): Promise<void>;
  start(appGuid: string): Promise<AppEntity>;
  stop(appGuid: string): Promise<AppEntity>;
  restart(appGuid: string): Promise<AppEntity>;
  getInstances(appGuid: string): Promise<Record<string, InstanceInfo>>;
  getStats(appGuid: string): Promise<Record<string, InstanceStats>>;
}
```

## Common Interfaces

### OAuthToken

```typescript
interface OAuthToken {
  token_type: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}
```

### CloudFoundryResponse

Generic response wrapper for list operations

```typescript
interface CloudFoundryResponse<T> {
  resources: T[];
  pages?: number;
  total_results?: number;
  total_pages?: number;
}
```

### ListResourceParams

Pagination and filter parameters

```typescript
interface ListResourceParams {
  page?: number;
  per_page?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  [key: string]: any;
}
```

## Examples

See [examples/](../examples/) directory for complete examples:

- `typescript-usage.ts` - Basic usage patterns
- `typescript-advanced.ts` - Advanced patterns with retry logic and pagination

## Error Handling

All API methods return Promises that reject with Error objects on failure:

```typescript
try {
  const app = await client.apps.getApp('invalid-guid');
} catch (error) {
  console.error('Error:', error.message);
}
```

## Type Safety

Full IntelliSense support in VSCode and other TypeScript-aware IDEs:

1. Method parameters are properly typed
2. Return types are fully specified
3. Available properties and methods are autocompleted
4. Documentation is available on hover
```

---

### Step 4.5: Verify Examples Compile

**Command**:

```bash
# Check TypeScript examples compile
npx tsc --noEmit examples/typescript-usage.ts
npx tsc --noEmit examples/typescript-advanced.ts
```

**Expected**: No compilation errors

---

## Checklist

- [ ] typescript-usage.ts created with basic examples
- [ ] typescript-advanced.ts created with advanced patterns
- [ ] README updated with TypeScript setup section
- [ ] TypeScript examples included in README
- [ ] docs/TypeScript-API-Reference.md created
- [ ] Examples compile without errors
- [ ] Code examples are runnable (pseudo-code is clear)
- [ ] All exported types documented
- [ ] Error handling patterns documented

## Next Phase

Proceed to [Phase 5: Testing & Validation](./phase-05-testing-and-validation.md)

---

*Est. Completion Time*: 1-2 hours  
*Files Created*: 2 example files, 1 API reference doc  
*Documentation Updates*: README.md
