/**
 * Basic TypeScript Usage Example for cf-nodejs-client
 *
 * Demonstrates:
 * - Authenticating via UAA
 * - Listing organizations, spaces, and apps
 * - Finding resources by name (convenience methods)
 * - Finding resources by GUID
 * - Auto-pagination (getAllResources)
 * - Memory cache for reducing API calls
 * - Creating and managing applications
 */

import {
  CloudController,
  UsersUAA,
  Apps,
  Spaces,
  Organizations,
  ServiceInstances,
  OAuthToken,
  FilterOptions
} from "cf-node-client";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const CF_API_URL = "https://api.<your-cf-domain>";
const UAA_URL = "https://login.<your-cf-domain>";
const USERNAME = "user@example.com";
const PASSWORD = "secret";

// ---------------------------------------------------------------------------
// 1. Authenticate with Cloud Foundry UAA
// ---------------------------------------------------------------------------
async function authenticate(): Promise<OAuthToken> {
  const uaa = new UsersUAA(UAA_URL);
  const token: OAuthToken = await uaa.login(USERNAME, PASSWORD);
  console.log("Authenticated successfully!");
  return token;
}

// ---------------------------------------------------------------------------
// 2. Get Cloud Controller Info
// ---------------------------------------------------------------------------
async function getCloudControllerInfo(): Promise<void> {
  const cc = new CloudController(CF_API_URL);
  const info = await cc.getInfo();
  console.log("CF API Version:", info.api_version);
  console.log("Description:", info.description);
}

// ---------------------------------------------------------------------------
// 3. List Organizations
// ---------------------------------------------------------------------------
async function listOrganizations(token: OAuthToken): Promise<void> {
  const orgs = new Organizations(CF_API_URL);
  orgs.setToken(token);

  const result = await orgs.getOrganizations();
  console.log(`Found ${result.total_results} organizations:`);
  for (const resource of result.resources) {
    console.log(`  - ${resource.entity?.name || resource.name}`);
  }
}

// ---------------------------------------------------------------------------
// 4. List Spaces in an Organization
// ---------------------------------------------------------------------------
async function listSpaces(token: OAuthToken, orgGuid: string): Promise<void> {
  const spaces = new Spaces(CF_API_URL);
  spaces.setToken(token);

  const filter: FilterOptions = { "organization_guid": orgGuid };
  const result = await spaces.getSpaces(filter);
  console.log(`Found ${result.total_results} spaces:`);
  for (const resource of result.resources) {
    console.log(`  - ${resource.entity?.name || resource.name}`);
  }
}

// ---------------------------------------------------------------------------
// 4b. Find Resources by Name (Convenience Methods)
// ---------------------------------------------------------------------------
async function findByNameExamples(token: OAuthToken): Promise<void> {
  const orgs = new Organizations(CF_API_URL);
  const spaces = new Spaces(CF_API_URL);
  const apps = new Apps(CF_API_URL);
  const si = new ServiceInstances(CF_API_URL);

  orgs.setToken(token);
  spaces.setToken(token);
  apps.setToken(token);
  si.setToken(token);

  // Find organization by name — single API call, returns first match or null
  const org = await orgs.getOrganizationByName("my-org");
  if (!org) {
    console.log("Organization not found");
    return;
  }
  const orgGuid: string = org.metadata?.guid || org.guid;
  console.log(`Found org: ${org.entity?.name || org.name} (${orgGuid})`);

  // Find space by name within org (recommended: pass orgGuid)
  const space = await spaces.getSpaceByName("dev", orgGuid);
  if (!space) {
    console.log("Space not found");
    return;
  }
  const spaceGuid: string = space.metadata?.guid || space.guid;
  console.log(`Found space: ${space.entity?.name || space.name} (${spaceGuid})`);

  // Find app by name within space (recommended: pass spaceGuid)
  const app = await apps.getAppByName("my-app", spaceGuid);
  if (app) {
    const appGuid: string = app.metadata?.guid || app.guid;
    console.log(`Found app: ${app.entity?.name || app.name} (${appGuid})`);
  }

  // Find service instance by name within space
  const instance = await si.getInstanceByName("my-database", spaceGuid);
  if (instance) {
    const instanceGuid: string = instance.metadata?.guid || instance.guid;
    console.log(`Found instance: ${instance.entity?.name || instance.name} (${instanceGuid})`);
  }
}

// ---------------------------------------------------------------------------
// 4c. Get Resources by GUID (Direct Lookup)
// ---------------------------------------------------------------------------
async function getByGuidExamples(token: OAuthToken): Promise<void> {
  const orgs = new Organizations(CF_API_URL);
  const spaces = new Spaces(CF_API_URL);
  const apps = new Apps(CF_API_URL);
  const si = new ServiceInstances(CF_API_URL);

  orgs.setToken(token);
  spaces.setToken(token);
  apps.setToken(token);
  si.setToken(token);

  // Direct GUID lookups
  const org = await orgs.getOrganization("org-guid-here");
  console.log(`Org: ${org.entity?.name || org.name}`);

  const space = await spaces.getSpace("space-guid-here");
  console.log(`Space: ${space.entity?.name || space.name}`);

  const app = await apps.getApp("app-guid-here");
  console.log(`App: ${app.entity?.name || app.name}`);

  const instance = await si.getInstance("instance-guid-here");
  console.log(`Instance: ${instance.entity?.name || instance.name}`);
}

// ---------------------------------------------------------------------------
// 5. Auto-Pagination — Get ALL Resources
// ---------------------------------------------------------------------------
async function getAllResourcesExample(token: OAuthToken): Promise<void> {
  const orgs = new Organizations(CF_API_URL);
  const spaces = new Spaces(CF_API_URL);
  const apps = new Apps(CF_API_URL);
  const si = new ServiceInstances(CF_API_URL);

  orgs.setToken(token);
  spaces.setToken(token);
  apps.setToken(token);
  si.setToken(token);

  // No manual pagination loop — the library pages through everything
  const allOrgs = await orgs.getAllOrganizations();
  console.log(`Total orgs: ${allOrgs.length}`);

  const allSpaces = await spaces.getAllSpaces();
  console.log(`Total spaces: ${allSpaces.length}`);

  // With a filter (e.g. only apps in a specific space)
  const allApps = await apps.getAllApps({ q: "space_guid:some-guid" });
  console.log(`Total apps in space: ${allApps.length}`);

  const allInstances = await si.getAllInstances();
  console.log(`Total service instances: ${allInstances.length}`);
}

// ---------------------------------------------------------------------------
// 5b. Memory Cache — Reduce Redundant API Calls
// ---------------------------------------------------------------------------
async function cacheExample(token: OAuthToken): Promise<void> {
  // Enable cache at construction time (60 s TTL)
  const orgs = new Organizations(CF_API_URL, { cache: true, cacheTTL: 60000 });
  orgs.setToken(token);

  // First call hits the API  →  result is cached
  const first = await orgs.getAllOrganizations();
  console.log(`First call (API): ${first.length} orgs`);

  // Second call within TTL  →  served from cache, zero HTTP calls
  const second = await orgs.getAllOrganizations();
  console.log(`Second call (cache): ${second.length} orgs`);

  // Clear cache when you need fresh data
  orgs.clearCache();

  // Or toggle at runtime
  orgs.disableCache();
  orgs.enableCache(30000); // re-enable with 30 s TTL
}

// ---------------------------------------------------------------------------
// 6. List Applications
// ---------------------------------------------------------------------------
async function listApps(token: OAuthToken): Promise<void> {
  const apps = new Apps(CF_API_URL);
  apps.setToken(token);

  const result = await apps.getApps();
  console.log(`\nFound ${result.total_results} applications:`);
  for (const resource of result.resources) {
    const name = resource.entity?.name || resource.name;
    const state = resource.entity?.state || resource.state;
    console.log(`  - ${name} (${state})`);
  }
}

// ---------------------------------------------------------------------------
// 6. Create and Start an Application (v3)
// ---------------------------------------------------------------------------
async function createAndStartApp(
  token: OAuthToken,
  spaceGuid: string
): Promise<string> {
  const apps = new Apps(CF_API_URL);
  apps.setToken(token);

  // Create app using v3 format
  const appOptions = {
    name: "my-ts-app",
    relationships: {
      space: {
        data: { guid: spaceGuid }
      }
    }
  };

  const newApp = await apps.add(appOptions);
  const appGuid: string = newApp.guid;
  console.log(`Created app: ${newApp.name} (${appGuid})`);

  // Start the application
  await apps.start(appGuid);
  console.log("Application started!");

  return appGuid;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  try {
    // Step 1: Authenticate
    const token = await authenticate();

    // Step 2: Get CF info
    await getCloudControllerInfo();

    // Step 3: List organizations
    await listOrganizations(token);

    // Step 4: List apps
    await listApps(token);

    // Step 5: Find resources by name (convenience methods)
    await findByNameExamples(token);

    // Step 6: Auto-pagination
    await getAllResourcesExample(token);

    // Step 7: Memory cache
    await cacheExample(token);

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
