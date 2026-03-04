/**
 * Basic TypeScript Usage Example for cf-nodejs-client
 *
 * Demonstrates:
 * - Authenticating via UAA
 * - Listing organizations, spaces, and apps
 * - Creating and managing applications
 */

import {
  CloudController,
  UsersUAA,
  Apps,
  Spaces,
  Organizations,
  OAuthToken,
  FilterOptions
} from "cf-node-client";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const CF_API_URL = "https://api.run.pivotal.io";
const UAA_URL = "https://login.run.pivotal.io";
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
  const orgs = new Organizations(CF_API_URL);
  orgs.setToken(token);

  const filter: FilterOptions = { "organization_guid": orgGuid };

  const spaces = new Spaces(CF_API_URL);
  spaces.setToken(token);

  const result = await spaces.getSpaces(filter);
  console.log(`Found ${result.total_results} spaces:`);
  for (const resource of result.resources) {
    console.log(`  - ${resource.entity?.name || resource.name}`);
  }
}

// ---------------------------------------------------------------------------
// 5. List Applications
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

    console.log("\nDone!");
  } catch (error) {
    console.error("Error:", (error as Error).message);
    process.exit(1);
  }
}

main();
