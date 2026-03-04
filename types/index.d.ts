/**
 * TypeScript type definitions for cf-nodejs-client
 *
 * Complete type support for Cloud Foundry API v2/v3 client.
 * Includes all model classes, service interfaces, and utility types.
 *
 * @packageDocumentation
 */

// ============================================================================
// COMMON TYPES & INTERFACES
// ============================================================================

/** OAuth token object returned by UAA */
export interface OAuthToken {
  token_type: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  jti?: string;
}

/** Filter/query options for API list calls */
export interface FilterOptions {
  [key: string]: string | number | boolean | undefined;
}

/** Delete operation options */
export interface DeleteOptions {
  async?: boolean;
  recursive?: boolean;
}

/** Common paginated API response format (v2) */
export interface ApiResponse<T = any> {
  total_results: number;
  total_pages: number;
  prev_url?: string | null;
  next_url?: string | null;
  resources: T[];
}

// ============================================================================
// CLOUD CONTROLLER BASE
// ============================================================================

/** Options for CloudControllerBase constructor */
export interface CloudControllerBaseOptions {
  apiVersion?: "v2" | "v3";
}

/**
 * Base class for all Cloud Foundry API models.
 * Supports both CF API v2 and v3 with automatic version routing.
 */
export class CloudControllerBase {
  /** Cloud Foundry API endpoint URL */
  API_URL: string;
  /** OAuth token object */
  UAA_TOKEN: OAuthToken;

  constructor(endPoint: string, options?: CloudControllerBaseOptions);

  /** Set Cloud Foundry API endpoint */
  setEndPoint(endPoint: string): void;
  /** Set OAuth token for authenticated requests */
  setToken(token: OAuthToken): void;
  /** Set API version (v2 or v3) */
  setApiVersion(version: string): void;
  /** Get current API version */
  getApiVersion(): string;
  /** Check if using API v3 */
  isUsingV3(): boolean;
  /** Check if using API v2 */
  isUsingV2(): boolean;
  /** Build URL for a resource endpoint */
  buildResourceUrl(resourceName: string, resourceId?: string | null): string;
  /** Get endpoint path for a resource */
  getEndpointPath(resourceName: string): string;
  /** Get v3 field name equivalent for a v2 field */
  getFieldName(resourceName: string, fieldName: string): string;
  /** Check if resource needs special handling for current API version */
  needsSpecialHandling(resourceName: string): boolean;
}

// ============================================================================
// CLOUD CONTROLLER
// ============================================================================

/**
 * Main CloudController entry-point class.
 * Provides info, feature flags, and general CF API access.
 */
export class CloudController extends CloudControllerBase {
  constructor(endPoint: string);

  /** Get Cloud Controller info */
  getInfo(): Promise<any>;
  /** Get all feature flags */
  getFeaturedFlags(): Promise<any>;
  /** Get a specific feature flag */
  getFeaturedFlag(flag: string): Promise<any>;
  /** Enable / set a feature flag */
  setFeaturedFlag(flag: string): Promise<any>;
}

// ============================================================================
// APPS
// ============================================================================

/**
 * Manage Cloud Foundry applications.
 * Supports both CF API v2 and v3 with dual-path methods.
 */
export class Apps extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all applications */
  getApps(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get application by GUID */
  getApp(appGuid: string): Promise<any>;
  /** Create a new application */
  add(appOptions: any): Promise<any>;
  /** Update an application */
  update(appGuid: string, appOptions: any): Promise<any>;
  /** Stop an application */
  stop(appGuid: string): Promise<any>;
  /** Start an application */
  start(appGuid: string): Promise<any>;
  /** Restart an application */
  restart(appGuid: string): Promise<any>;
  /** Get application summary */
  getSummary(appGuid: string): Promise<any>;
  /** Delete an application */
  remove(appGuid: string): Promise<any>;
  /** Get application stats */
  getStats(appGuid: string): Promise<any>;
  /** Associate a route with an application */
  associateRoute(appGuid: string, routeGuid: string): Promise<any>;
  /** Upload application bits (zip file) */
  upload(appGuid: string, filePath: string, async?: boolean): Promise<any>;
  /** Get application instances */
  getInstances(appGuid: string): Promise<any>;
  /** Get routes associated with an application */
  getAppRoutes(appGuid: string): Promise<any>;
  /** Get service bindings for an application */
  getServiceBindings(appGuid: string, filter?: FilterOptions): Promise<any>;
  /** Remove a service binding from an application */
  removeServiceBindings(appGuid: string, serviceBindingGuid: string): Promise<any>;
  /** Get environment variables for an application */
  getEnvironmentVariables(appGuid: string): Promise<any>;
  /** Set environment variables for an application */
  setEnvironmentVariables(appGuid: string, variables: any): Promise<any>;
  /** Get droplets for an application (v3) */
  getDroplets(appGuid: string): Promise<any>;
  /** Get packages for an application (v3) */
  getPackages(appGuid: string): Promise<any>;
  /** Get processes for an application (v3) */
  getProcesses(appGuid: string): Promise<any>;
}

// ============================================================================
// SPACES
// ============================================================================

/** Manage Cloud Foundry spaces */
export class Spaces extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all spaces */
  getSpaces(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a specific space */
  getSpace(guid: string): Promise<any>;
  /** Get space summary */
  getSummary(guid: string): Promise<any>;
  /** Create a new space */
  add(spaceOptions: any): Promise<any>;
  /** Update a space */
  update(guid: string, spaceOptions: any): Promise<any>;
  /** Delete a space */
  remove(guid: string, deleteOptions?: DeleteOptions): Promise<any>;
  /** Get applications in a space */
  getApps(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get users in a space */
  getUsers(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get managers of a space */
  getManagers(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get developers of a space */
  getDevelopers(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get auditors of a space */
  getAuditors(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
}

// ============================================================================
// ORGANIZATIONS
// ============================================================================

/** Manage Cloud Foundry organizations */
export class Organizations extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all organizations */
  getOrganizations(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a specific organization */
  getOrganization(guid: string): Promise<any>;
  /** Get organization memory usage */
  getMemoryUsage(guid: string): Promise<any>;
  /** Get organization summary */
  getSummary(guid: string): Promise<any>;
  /** Get private domains of an organization */
  getPrivateDomains(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Create a new organization */
  add(orgOptions: any): Promise<any>;
  /** Update an organization */
  update(guid: string, orgOptions: any): Promise<any>;
  /** Delete an organization */
  remove(guid: string, deleteOptions?: DeleteOptions): Promise<any>;
  /** Get users of an organization */
  getUsers(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get managers of an organization */
  getManagers(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get auditors of an organization */
  getAuditors(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
}

// ============================================================================
// BUILDPACKS
// ============================================================================

/** Manage Cloud Foundry build packs */
export class BuildPacks {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all build packs */
  getBuildPacks(filter?: FilterOptions): Promise<any>;
  /** Get a specific build pack */
  getBuildPack(guid: string): Promise<any>;
  /** Update a build pack */
  update(guid: string, buildPackOptions: any): Promise<any>;
  /** Delete a build pack */
  remove(guid: string): Promise<any>;
}

// ============================================================================
// DOMAINS
// ============================================================================

/** Manage Cloud Foundry domains */
export class Domains {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all domains */
  getDomains(filter?: FilterOptions): Promise<any>;
  /** Get a specific domain */
  getDomain(guid: string): Promise<any>;
  /** Create a new domain */
  add(domainOptions: any): Promise<any>;
  /** Delete a domain */
  remove(guid: string): Promise<any>;
}

// ============================================================================
// ROUTES
// ============================================================================

/** Manage Cloud Foundry routes */
export class Routes extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all routes */
  getRoutes(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a specific route */
  getRoute(guid: string): Promise<any>;
  /** Create a new route */
  add(routeOptions: any): Promise<any>;
  /** Update a route */
  update(guid: string, routeOptions: any): Promise<any>;
  /** Delete a route */
  remove(guid: string, deleteOptions?: DeleteOptions): Promise<any>;
  /** Get applications associated with a route */
  getApps(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
}

// ============================================================================
// SERVICES
// ============================================================================

/** Manage Cloud Foundry services */
export class Services extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all services */
  getServices(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a specific service */
  getService(guid: string): Promise<any>;
  /** Get service plans for a service */
  getServicePlans(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
}

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

/** Manage Cloud Foundry service instances */
export class ServiceInstances extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all service instances */
  getInstances(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a specific service instance */
  getInstance(guid: string): Promise<any>;
  /** Get service instance permissions */
  getInstancePermissions(guid: string): Promise<any>;
  /** Create a new service instance */
  add(instanceOptions: any): Promise<any>;
  /** Update a service instance */
  update(guid: string, instanceOptions: any): Promise<any>;
  /** Delete a service instance */
  remove(guid: string, deleteOptions?: DeleteOptions): Promise<any>;
  /** Get service bindings for a service instance */
  getServiceBindings(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
}

// ============================================================================
// SERVICE BINDINGS
// ============================================================================

/** Manage Cloud Foundry service bindings */
export class ServiceBindings extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all service bindings */
  getServiceBindings(filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a specific service binding */
  getServiceBinding(guid: string): Promise<any>;
  /** Create a new service binding */
  add(bindingOptions: any): Promise<any>;
  /** Update a service binding */
  update(guid: string, bindingOptions: any): Promise<any>;
  /** Delete a service binding */
  remove(guid: string, deleteOptions?: DeleteOptions): Promise<any>;
}

// ============================================================================
// SERVICE PLANS
// ============================================================================

/** Manage Cloud Foundry service plans */
export class ServicePlans extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all service plans */
  getServicePlans(filter?: FilterOptions): Promise<any>;
  /** Get a specific service plan */
  getServicePlan(guid: string): Promise<any>;
  /** Get service plan instances */
  getServicePlanInstances(guid: string): Promise<any>;
  /** Delete a service plan */
  remove(guid: string): Promise<any>;
}

// ============================================================================
// USERS
// ============================================================================

/** Manage Cloud Foundry users */
export class Users {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all users */
  getUsers(filter?: FilterOptions): Promise<any>;
  /** Get a specific user */
  getUser(guid: string): Promise<any>;
  /** Create a new user */
  add(userOptions: any): Promise<any>;
  /** Delete a user */
  remove(guid: string): Promise<any>;
}

// ============================================================================
// EVENTS
// ============================================================================

/** Manage Cloud Foundry events */
export class Events {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all events */
  getEvents(filter?: FilterOptions): Promise<any>;
  /** Get a specific event */
  getEvent(guid: string): Promise<any>;
}

// ============================================================================
// JOBS
// ============================================================================

/** Manage Cloud Foundry background jobs/tasks */
export class Jobs {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all jobs */
  getJobs(filter?: FilterOptions): Promise<any>;
  /** Get a specific job */
  getJob(guid: string): Promise<any>;
  /** Create a new task/job for an application */
  add(appGuid: string, taskOptions: any): Promise<any>;
  /** Cancel a running job */
  cancel(guid: string): Promise<any>;
}

// ============================================================================
// STACKS
// ============================================================================

/** Manage Cloud Foundry stacks */
export class Stacks {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all stacks */
  getStacks(filter?: FilterOptions): Promise<any>;
  /** Get a specific stack */
  getStack(guid: string): Promise<any>;
}

// ============================================================================
// USER PROVIDED SERVICES
// ============================================================================

/** Manage Cloud Foundry user-provided services */
export class UserProvidedServices extends CloudControllerBase {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  /** List all user-provided services */
  getServices(): Promise<any>;
  /** Get a specific user-provided service */
  getService(guid: string): Promise<any>;
  /** Create a new user-provided service */
  add(upsOptions: any): Promise<any>;
  /** Delete a user-provided service */
  remove(guid: string): Promise<any>;
  /** Get service bindings for a user-provided service */
  getServiceBindings(guid: string, filter?: FilterOptions): Promise<any>;
}

// ============================================================================
// SPACES QUOTA
// ============================================================================

/** Manage Cloud Foundry space quotas */
export class SpacesQuota {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all space quotas */
  getSpaceQuotas(filter?: FilterOptions): Promise<any>;
  /** Get a specific space quota */
  getSpaceQuota(guid: string): Promise<any>;
  /** Create a new space quota */
  add(quotaOptions: any): Promise<any>;
  /** Update a space quota */
  update(guid: string, quotaOptions: any): Promise<any>;
  /** Delete a space quota */
  remove(guid: string): Promise<any>;
}

// ============================================================================
// ORGANIZATIONS QUOTA
// ============================================================================

/** Manage Cloud Foundry organization quotas */
export class OrganizationsQuota {
  constructor(endpointUrl: string, accessToken?: OAuthToken);

  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: string): void;
  getApiVersion(): string;
  isUsingV3(): boolean;
  isUsingV2(): boolean;

  /** List all organization quotas */
  getOrganizationQuotas(filter?: FilterOptions): Promise<any>;
  /** Get a specific organization quota */
  getOrganizationQuota(guid: string): Promise<any>;
  /** Create a new organization quota */
  add(quotaOptions: any): Promise<any>;
  /** Update an organization quota */
  update(guid: string, quotaOptions: any): Promise<any>;
  /** Delete an organization quota */
  remove(guid: string): Promise<any>;
}

// ============================================================================
// METRICS - LOGS
// ============================================================================

/**
 * Manage Cloud Foundry application logs.
 * Note: Logs has its own constructor pattern (no endpointUrl param).
 * Use setEndPoint() and setToken() after construction.
 */
export class Logs {
  constructor();

  /** Set logging API endpoint */
  setEndPoint(endPoint: string): void;
  /** Set OAuth token */
  setToken(token: OAuthToken): void;
  /** Get recent logs for an application */
  getRecent(appGuid: string): Promise<any>;
}

// ============================================================================
// UAA - USERS
// ============================================================================

/** Manage Cloud Foundry UAA users (authentication & identity) */
export class UsersUAA {
  /** UAA API endpoint URL */
  UAA_API_URL: string;
  UAA_TOKEN: OAuthToken;

  constructor(endPoint: string);

  /** Set UAA API endpoint */
  setEndPoint(endPoint: string): void;
  /** Set OAuth token */
  setToken(token: OAuthToken): void;
  /** Create a UAA user */
  add(uaaOptions: any): Promise<any>;
  /** Update a UAA user's password */
  updatePassword(uaaGuid: string, uaaOptions: any): Promise<any>;
  /** Delete a UAA user */
  remove(uaaGuid: string): Promise<any>;
  /** Search/list UAA users */
  getUsers(searchOptions?: string): Promise<any>;
  /** Login with username and password, returns OAuth token */
  login(username: string, password: string): Promise<OAuthToken>;
  /** Refresh an OAuth token */
  refreshToken(): Promise<OAuthToken>;
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/** Package version string */
export declare const version: string;
