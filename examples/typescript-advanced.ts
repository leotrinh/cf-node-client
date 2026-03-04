/**
 * Advanced TypeScript Usage Example for cf-nodejs-client
 *
 * Demonstrates:
 * - Service management (create instances, bind to apps)
 * - Environment variables management
 * - Space/Org quota management
 * - Token refresh pattern
 * - Error handling patterns
 * - API v2 vs v3 switching
 */

import {
  CloudController,
  UsersUAA,
  Apps,
  Spaces,
  Organizations,
  Services,
  ServiceInstances,
  ServiceBindings,
  Routes,
  Domains,
  SpacesQuota,
  Logs,
  OAuthToken,
  FilterOptions,
  ApiResponse
} from "cf-node-client";

const CF_API_URL = "https://api.run.pivotal.io";
const UAA_URL = "https://login.run.pivotal.io";

// ---------------------------------------------------------------------------
// Token Management with Auto-Refresh
// ---------------------------------------------------------------------------
class TokenManager {
  private uaa: UsersUAA;
  private token: OAuthToken | null = null;

  constructor(uaaUrl: string) {
    this.uaa = new UsersUAA(uaaUrl);
  }

  async login(username: string, password: string): Promise<OAuthToken> {
    this.token = await this.uaa.login(username, password);
    return this.token;
  }

  async refresh(): Promise<OAuthToken> {
    if (!this.token) {
      throw new Error("Not authenticated. Call login() first.");
    }
    this.uaa.setToken(this.token);
    this.token = await this.uaa.refreshToken();
    return this.token;
  }

  getToken(): OAuthToken {
    if (!this.token) {
      throw new Error("Not authenticated. Call login() first.");
    }
    return this.token;
  }
}

// ---------------------------------------------------------------------------
// Service Instance Provisioning
// ---------------------------------------------------------------------------
async function provisionService(
  token: OAuthToken,
  spaceGuid: string,
  servicePlanGuid: string
): Promise<string> {
  const serviceInstances = new ServiceInstances(CF_API_URL);
  serviceInstances.setToken(token);

  const instanceOptions = {
    name: "my-database",
    space_guid: spaceGuid,
    service_plan_guid: servicePlanGuid,
    parameters: {
      storage_size: "10gb"
    }
  };

  const instance = await serviceInstances.add(instanceOptions);
  console.log(`Service instance created: ${instance.entity?.name || instance.name}`);
  return instance.metadata?.guid || instance.guid;
}

// ---------------------------------------------------------------------------
// Bind Service to Application
// ---------------------------------------------------------------------------
async function bindService(
  token: OAuthToken,
  appGuid: string,
  serviceInstanceGuid: string
): Promise<void> {
  const serviceBindings = new ServiceBindings(CF_API_URL);
  serviceBindings.setToken(token);

  const bindingOptions = {
    app_guid: appGuid,
    service_instance_guid: serviceInstanceGuid
  };

  await serviceBindings.add(bindingOptions);
  console.log("Service bound to application successfully");
}

// ---------------------------------------------------------------------------
// Environment Variables Management
// ---------------------------------------------------------------------------
async function manageEnvVars(
  token: OAuthToken,
  appGuid: string
): Promise<void> {
  const apps = new Apps(CF_API_URL);
  apps.setToken(token);

  // Get current environment variables
  const envVars = await apps.getEnvironmentVariables(appGuid);
  console.log("Current env vars:", JSON.stringify(envVars, null, 2));

  // Set new environment variables
  await apps.setEnvironmentVariables(appGuid, {
    NODE_ENV: "production",
    LOG_LEVEL: "info",
    DATABASE_URL: "postgres://..."
  });

  console.log("Environment variables updated");
}

// ---------------------------------------------------------------------------
// Route Management
// ---------------------------------------------------------------------------
async function createRoute(
  token: OAuthToken,
  spaceGuid: string,
  domainGuid: string,
  hostname: string
): Promise<string> {
  const routes = new Routes(CF_API_URL);
  routes.setToken(token);

  const routeOptions = {
    host: hostname,
    domain_guid: domainGuid,
    space_guid: spaceGuid
  };

  const route = await routes.add(routeOptions);
  const routeGuid: string = route.metadata?.guid || route.guid;
  console.log(`Route created: ${hostname}`);
  return routeGuid;
}

async function mapRoute(
  token: OAuthToken,
  appGuid: string,
  routeGuid: string
): Promise<void> {
  const apps = new Apps(CF_API_URL);
  apps.setToken(token);
  await apps.associateRoute(appGuid, routeGuid);
  console.log("Route mapped to application");
}

// ---------------------------------------------------------------------------
// Pagination Helper
// ---------------------------------------------------------------------------
async function getAllPages<T>(
  fetchFn: (filter?: FilterOptions) => Promise<ApiResponse<T>>,
  filter?: FilterOptions
): Promise<T[]> {
  const allResources: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const currentFilter: FilterOptions = { ...filter, page };
    const response = await fetchFn(currentFilter);
    allResources.push(...response.resources);
    hasMore = response.next_url !== null && response.next_url !== undefined;
    page++;
  }

  return allResources;
}

// ---------------------------------------------------------------------------
// Application Logs
// ---------------------------------------------------------------------------
async function getAppLogs(
  token: OAuthToken,
  loggingEndpoint: string,
  appGuid: string
): Promise<void> {
  const logs = new Logs();
  logs.setEndPoint(loggingEndpoint);
  logs.setToken(token);

  const recentLogs = await logs.getRecent(appGuid);
  console.log("Recent logs:", recentLogs);
}

// ---------------------------------------------------------------------------
// API Version Switching
// ---------------------------------------------------------------------------
async function demonstrateVersionSwitching(token: OAuthToken): Promise<void> {
  // Using v3 (default)
  const appsV3 = new Apps(CF_API_URL);
  appsV3.setToken(token);
  console.log("API Version:", appsV3.getApiVersion()); // "v3"

  const v3Apps = await appsV3.getApps();
  console.log(`v3 - Found ${v3Apps.resources.length} apps`);

  // Switch to v2
  appsV3.setApiVersion("v2");
  console.log("API Version:", appsV3.getApiVersion()); // "v2"

  const v2Apps = await appsV3.getApps();
  console.log(`v2 - Found ${v2Apps.total_results} apps`);
}

// ---------------------------------------------------------------------------
// Error Handling Pattern
// ---------------------------------------------------------------------------
async function safeApiCall<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const err = error as Error & { statusCode?: number };
    console.error(`[${operation}] Failed:`, err.message);
    if (err.statusCode === 401) {
      console.error("  -> Token expired. Please refresh.");
    } else if (err.statusCode === 403) {
      console.error("  -> Insufficient permissions.");
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const tokenManager = new TokenManager(UAA_URL);

  try {
    // Authenticate
    const token = await tokenManager.login("user@example.com", "secret");

    // Get CF info for logging endpoint
    const cc = new CloudController(CF_API_URL);
    const info = await cc.getInfo();
    const loggingEndpoint: string = info.logging_endpoint;

    // Demonstrate pagination
    const apps = new Apps(CF_API_URL);
    apps.setToken(token);
    const allApps = await getAllPages(
      (filter) => apps.getApps(filter)
    );
    console.log(`Total apps across all pages: ${allApps.length}`);

    // Safe API call with error handling
    await safeApiCall("list-spaces", async () => {
      const spaces = new Spaces(CF_API_URL);
      spaces.setToken(token);
      return spaces.getSpaces();
    });

    // Demonstrate v2/v3 switching
    await demonstrateVersionSwitching(token);

    // Token refresh
    const newToken = await tokenManager.refresh();
    console.log("Token refreshed successfully");

    console.log("\nAdvanced demo complete!");
  } catch (error) {
    console.error("Fatal error:", (error as Error).message);
    process.exit(1);
  }
}

main();
