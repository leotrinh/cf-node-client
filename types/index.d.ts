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
  /** Enable in-memory cache for getAllResources calls */
  cache?: boolean;
  /** Cache TTL in milliseconds (default: 30000) */
  cacheTTL?: number;
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

  // ── Cache ────────────────────────────────────────────────────────────
  /** Enable the in-memory cache */
  enableCache(ttlMs?: number): void;
  /** Disable the cache and clear all entries */
  disableCache(): void;
  /** Clear all cached entries (cache stays enabled) */
  clearCache(): void;

  // ── Pagination ───────────────────────────────────────────────────────
  /**
   * Auto-paginate through all pages of a list endpoint.
   * Returns a flat array of every resource.
   */
  getAllResources<T = any>(
    fetchFn: (filter?: FilterOptions) => Promise<ApiResponse<T>>,
    filter?: FilterOptions
  ): Promise<T[]>;
}

// ============================================================================
// CLOUD CONTROLLER
// ============================================================================

/**
 * Main CloudController entry-point class.
 * Provides info, feature flags, and general CF API access.
 */
export class CloudController extends CloudControllerBase {
  constructor(endPoint: string, options?: CloudControllerBaseOptions);

  /** Get Cloud Controller info */
  getInfo(): Promise<any>;
  /** Get all feature flags */
  getFeaturedFlags(): Promise<any>;
  /** Get a specific feature flag */
  getFeaturedFlag(flag: string): Promise<any>;
  /** Enable / set a feature flag */
  setFeaturedFlag(flag: string, flagOptions?: any): Promise<any>;
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
  /** Find an application by name using server-side filtering. Optionally filter by space GUID. Returns first match or null. */
  getAppByName(name: string, spaceGuid?: string): Promise<any | null>;
  /** Get ALL apps across all pages (auto-pagination). Returns flat array. */
  getAllApps(filter?: FilterOptions): Promise<any[]>;
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
  /** Copy app bits from source app (v2 only) */
  copyBits(appGuid: string, sourceAppGuid: string): Promise<any>;
  /** Copy a package from one app to another (v3 only) */
  copyPackage(sourcePackageGuid: string, targetAppGuid: string): Promise<any>;
  /** Download app bits (v2: app GUID, v3: package GUID) */
  downloadBits(guid: string): Promise<Buffer>;
  /** Download a droplet (v3 only) */
  downloadDroplet(dropletGuid: string): Promise<Buffer>;
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
  /** Find a space by name using server-side filtering. Optionally filter by org GUID. Returns first match or null. */
  getSpaceByName(name: string, orgGuid?: string): Promise<any | null>;
  /** Get ALL spaces across all pages (auto-pagination). Returns flat array. */
  getAllSpaces(filter?: FilterOptions): Promise<any[]>;
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
  /** Find an organization by name using server-side filtering. Returns first match or null. */
  getOrganizationByName(name: string): Promise<any | null>;
  /** Get ALL organizations across all pages (auto-pagination). Returns flat array. */
  getAllOrganizations(filter?: FilterOptions): Promise<any[]>;
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
  /** Find a service instance by name using server-side filtering. Optionally filter by space GUID. Returns first match or null. */
  getInstanceByName(name: string, spaceGuid?: string): Promise<any | null>;
  /** Get ALL service instances across all pages (auto-pagination). Returns flat array. */
  getAllInstances(filter?: FilterOptions): Promise<any[]>;
  /** Get service instance permissions (v2 only) */
  getInstancePermissions(guid: string): Promise<any>;
  /** Create a service instance (accepts_incomplete enables async provisioning) */
  add(instanceOptions: any, acceptsIncomplete?: boolean): Promise<any>;
  /** Update a service instance (accepts_incomplete enables async update) */
  update(guid: string, instanceOptions: any, acceptsIncomplete?: boolean): Promise<any>;
  /** Delete a service instance (accepts_incomplete enables async deletion) */
  remove(guid: string, deleteOptions?: DeleteOptions, acceptsIncomplete?: boolean): Promise<any>;
  /** Get service bindings for a service instance */
  getServiceBindings(guid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get service instances filtered by space GUID */
  getInstancesBySpace(spaceGuid: string, filter?: FilterOptions): Promise<ApiResponse>;
  /** Get a service instance by name within a specific space */
  getInstanceByNameInSpace(name: string, spaceGuid: string): Promise<any>;
  /** Start a managed service instance (v3 only, e.g. HANA) */
  startInstance(guid: string): Promise<any>;
  /** Stop a managed service instance (v3 only, e.g. HANA) */
  stopInstance(guid: string): Promise<any>;
  /** Get last operation status for a service instance */
  getOperationStatus(guid: string): Promise<any>;
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
  constructor(endpointUrl: string, options?: CloudControllerBaseOptions);

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

/** Manage Cloud Foundry audit events (ES6 class extending CloudControllerBase) */
export class Events extends CloudControllerBase {
  constructor(endPoint: string, options?: CloudControllerBaseOptions);

  /** List all events (v2: /v2/events, v3: /v3/audit_events) */
  getEvents(filter?: FilterOptions): Promise<any>;
  /** Get a specific event by GUID */
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
  constructor(endpointUrl: string, options?: CloudControllerBaseOptions);

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
/** Structured log entry returned by getRecentParsed */
export interface LogEntry {
  timestamp: Date | null;
  timestampRaw: string | null;
  source: string;
  sourceId: string;
  messageType: string;
  message: string;
}

export class Logs {
  constructor();

  /** Set logging API endpoint */
  setEndPoint(endPoint: string): void;
  /** Set OAuth token */
  setToken(token: OAuthToken): void;
  /** Get recent raw logs for an application */
  getRecent(appGuid: string): Promise<string>;
  /** Get recent logs with parsed timestamps and structured output */
  getRecentParsed(appGuid: string): Promise<LogEntry[]>;
  /** Parse raw CF log output into structured entries */
  static parseLogs(rawLogs: string): LogEntry[];
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
  /** Login with client_credentials grant type */
  loginWithClientCredentials(clientId: string, clientSecret: string): Promise<OAuthToken>;
  /** Login with a one-time passcode (SSO) */
  loginWithPasscode(passcode: string): Promise<OAuthToken>;
  /** Login with an authorization code (OAuth2 code flow) */
  loginWithAuthorizationCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<OAuthToken>;
  /** Validate and introspect a token server-side */
  getTokenInfo(token: string, clientId: string, clientSecret: string): Promise<any>;
  /** Decode a JWT token locally (no signature verification) */
  decodeToken(token: string): any;
}

// ============================================================================
// MODULE EXPORTS
// ============================================================================

// ============================================================================
// UTILITIES
// ============================================================================

/** File descriptor for multipart uploads (replaces restler.file()) */
export interface FileDescriptor {
  _filePath: string;
  _filename: string;
  _contentType: string;
  _size: number;
}

/** HTTP utility class used internally by all models */
export class HttpUtils {
  constructor();
  request(options: any, httpStatusAssert: number, jsonOutput: boolean): Promise<any>;
  requestV3(method: string, url: string, token: string, data?: any, expectedStatus?: number): Promise<any>;
  requestV2(method: string, url: string, token: string, data?: any, expectedStatus?: number): Promise<any>;
  upload(url: string, options: any, httpStatusAssert: number, jsonOutput: boolean): Promise<any>;
  /** Create a file descriptor for multipart uploads */
  static file(filePath: string, contentType?: string, size?: number): FileDescriptor;
}

/** .cfignore file parser and filter utility */
export class CfIgnoreHelper {
  constructor();
  /** Create from a .cfignore file path */
  static fromFile(cfIgnorePath: string): CfIgnoreHelper;
  /** Create from a directory (looks for .cfignore inside) */
  static fromDirectory(dirPath: string): CfIgnoreHelper;
  /** Parse and add patterns from .cfignore content */
  addPatterns(content: string): CfIgnoreHelper;
  /** Check if a relative path should be ignored */
  isIgnored(relativePath: string, isDirectory?: boolean): boolean;
  /** Filter a list of paths, removing ignored ones */
  filter(filePaths: string[]): string[];
}

/** Package version string */
export declare const version: string;

/** Simple in-memory cache with per-entry TTL */
export class CacheService {
  constructor(defaultTTLMs?: number);
  /** Retrieve a cached value (returns undefined if expired or missing) */
  get<T = any>(key: string): T | undefined;
  /** Store a value with optional per-entry TTL override */
  set(key: string, value: any, ttlMs?: number): void;
  /** Check if a non-expired entry exists */
  has(key: string): boolean;
  /** Remove a single entry */
  delete(key: string): boolean;
  /** Remove all entries */
  clear(): void;
  /** Remove entries whose key starts with given prefix */
  invalidateByPrefix(prefix: string): void;
  /** Number of currently stored (possibly expired) entries */
  readonly size: number;
}
