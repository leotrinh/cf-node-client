# Phase 2: Create Type Declarations

**Duration**: 2-3 hours | **Priority**: CRITICAL | **Status**: CORE WORK

## Context

This phase creates comprehensive TypeScript type definitions for all exported classes and utilities. Type declarations are hand-written to provide clear, well-documented API surface.

## Objectives

1. ✅ Create types for CloudController base class
2. ✅ Generate types for all cloud controller models (Apps, Spaces, Organizations, etc.)
3. ✅ Create types for Logs (metrics)
4. ✅ Create types for UsersUAA
5. ✅ Create types for utilities (HttpStatus, HttpMethods, HttpUtils)

## Data Types & Interfaces

### Core Interfaces to Define

```typescript
// Common API response pattern
interface CloudFoundryResponse<T> {
  resources: T[];
  pages?: number;
  total_results?: number;
  total_pages?: number;
  pagination?: PaginationInfo;
  [key: string]: any;
}

// Token types
interface OAuthToken {
  token_type: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

// Filter options
interface FilterOptions {
  [key: string]: string | number | boolean;
}

// Request options
interface RequestOptions {
  method?: string;
  url: string;
  headers: Record<string, string>;
  qs?: FilterOptions;
  body?: any;
  json?: any;
}
```

## Implementation Steps

### Step 2.1: Define Base Classes & Common Types

**File**: `types/index.d.ts`

Start with foundational types:

```typescript
/**
 * CloudFoundryResponse - Standard API response wrapper
 */
export interface CloudFoundryResponse<T = any> {
  resources: T[];
  pages?: number;
  total_results?: number;
  total_pages?: number;
  pagination?: {
    total_results: number;
    total_pages: number;
    first: { href: string };
    last: { href: string };
    next: { href: string };
    previous: { href: string };
  };
  next_url?: string;
  prev_url?: string;
  [key: string]: any;
}

/**
 * OAuthToken - OAuth/UAA token structure
 */
export interface OAuthToken {
  token_type: string;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  jti?: string;
  scope?: string;
}

/**
 * FilterOptions - Query filter parameters
 */
export interface FilterOptions {
  [key: string]: string | number | boolean | string[];
}

/**
 * RequestOptions - HTTP request configuration
 */
export interface RequestOptions {
  method?: string;
  url: string;
  headers: Record<string, string>;
  qs?: FilterOptions;
  body?: any;
  json?: boolean;
  timeout?: number;
}

/**
 * EntityBase - Common properties for Cloud Foundry entities
 */
export interface EntityBase {
  guid: string;
  name?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}
```

---

### Step 2.2: Create CloudControllerBase Types

**Location**: `types/index.d.ts` (append to file)

```typescript
/**
 * CloudControllerBase configuration
 */
export interface CloudControllerOptions {
  apiVersion?: 'v2' | 'v3';
}

/**
 * CloudControllerBase - Base class for all Cloud Controller models
 */
export declare class CloudControllerBase {
  API_URL: string;
  UAA_TOKEN: OAuthToken;
  
  constructor(endPoint: string, options?: CloudControllerOptions);
  
  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  setApiVersion(version: 'v2' | 'v3'): void;
  getApiVersion(): 'v2' | 'v3';
  isUsingV3(): boolean;
  isUsingV2(): boolean;
  
  protected getAuthorizationHeader(): string;
  protected buildResourceUrl(...args: string[]): string;
}

/**
 * Generic resource list response
 */
export interface ListResourceParams {
  page?: number;
  per_page?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  [key: string]: any;
}
```

---

### Step 2.3: Create Cloud Controller Model Types

**Location**: `types/index.d.ts` (append)

#### Apps

```typescript
// ============ APPS ============

export interface AppEntity extends EntityBase {
  space_guid: string;
  buildpack: string;
  memory: number;
  instances: number;
  disk_quota: number;
  state: 'STARTED' | 'STOPPED';
  version: string;
  production?: boolean;
  environment_json?: Record<string, any>;
  detected_buildpack?: string;
  package_state?: string;
}

export interface CreateAppOptions {
  name: string;
  space_guid: string;
  buildpack?: string;
  memory?: number;
  instances?: number;
  disk_quota?: number;
  environment_json?: Record<string, any>;
}

export interface UpdateAppOptions {
  name?: string;
  buildpack?: string;
  memory?: number;
  instances?: number;
  disk_quota?: number;
  state?: 'STARTED' | 'STOPPED';
  environment_json?: Record<string, any>;
}

export declare class Apps extends CloudControllerBase {
  getApps(filter?: ListResourceParams): Promise<CloudFoundryResponse<AppEntity>>;
  getApp(appGuid: string): Promise<AppEntity>;
  create(appOptions: CreateAppOptions): Promise<AppEntity>;
  update(appGuid: string, options: UpdateAppOptions): Promise<AppEntity>;
  delete(appGuid: string): Promise<void>;
  start(appGuid: string): Promise<AppEntity>;
  stop(appGuid: string): Promise<AppEntity>;
  restart(appGuid: string): Promise<AppEntity>;
  getInstances(appGuid: string): Promise<Record<string, any>>;
  getStats(appGuid: string): Promise<Record<string, any>>;
}
```

#### Spaces

```typescript
// ============ SPACES ============

export interface SpaceEntity extends EntityBase {
  organization_guid: string;
  space_quota_definition_guid?: string;
  allow_ssh?: boolean;
  apps_url?: string;
  managers_url?: string;
  developers_url?: string;
  auditors_url?: string;
}

export interface CreateSpaceOptions {
  name: string;
  organization_guid: string;
  space_quota_definition_guid?: string;
  allow_ssh?: boolean;
}

export declare class Spaces extends CloudControllerBase {
  getSpaces(filter?: ListResourceParams): Promise<CloudFoundryResponse<SpaceEntity>>;
  getSpace(spaceGuid: string): Promise<SpaceEntity>;
  create(spaceOptions: CreateSpaceOptions): Promise<SpaceEntity>;
  update(spaceGuid: string, options: Partial<CreateSpaceOptions>): Promise<SpaceEntity>;
  delete(spaceGuid: string): Promise<void>;
  getSummary(spaceGuid: string): Promise<Record<string, any>>;
}
```

#### Organizations

```typescript
// ============ ORGANIZATIONS ============

export interface OrganizationEntity extends EntityBase {
  billing_enabled?: boolean;
  status?: string;
  quota_definition_guid?: string;
  spaces_url?: string;
  users_url?: string;
  managers_url?: string;
  billing_managers_url?: string;
  auditors_url?: string;
}

export interface CreateOrgOptions {
  name: string;
  billing_enabled?: boolean;
  quota_definition_guid?: string;
}

export declare class Organizations extends CloudControllerBase {
  getOrganizations(filter?: ListResourceParams): Promise<CloudFoundryResponse<OrganizationEntity>>;
  getOrganization(orgGuid: string): Promise<OrganizationEntity>;
  create(orgOptions: CreateOrgOptions): Promise<OrganizationEntity>;
  update(orgGuid: string, options: Partial<CreateOrgOptions>): Promise<OrganizationEntity>;
  delete(orgGuid: string): Promise<void>;
  getSummary(orgGuid: string): Promise<Record<string, any>>;
}
```

#### Routes

```typescript
// ============ ROUTES ============

export interface RouteEntity extends EntityBase {
  host: string;
  domain_guid: string;
  space_guid: string;
  port?: number;
  path?: string;
  service_instance_guid?: string;
}

export interface CreateRouteOptions {
  host?: string;
  domain_guid: string;
  space_guid: string;
  port?: number;
  path?: string;
}

export declare class Routes extends CloudControllerBase {
  getRoutes(filter?: ListResourceParams): Promise<CloudFoundryResponse<RouteEntity>>;
  getRoute(routeGuid: string): Promise<RouteEntity>;
  create(routeOptions: CreateRouteOptions): Promise<RouteEntity>;
  update(routeGuid: string, options: Partial<CreateRouteOptions>): Promise<RouteEntity>;
  delete(routeGuid: string): Promise<void>;
}
```

#### Services

```typescript
// ============ SERVICES ============

export interface ServiceEntity extends EntityBase {
  label: string;
  provider: string;
  url: string;
  description: string;
  active: boolean;
  bindable: boolean;
  unique_id?: string;
  extra?: Record<string, any>;
  requires?: string[];
  service_plans_url?: string;
}

export declare class Services extends CloudControllerBase {
  getServices(filter?: ListResourceParams): Promise<CloudFoundryResponse<ServiceEntity>>;
  getService(serviceGuid: string): Promise<ServiceEntity>;
}
```

#### ServiceInstances

```typescript
// ============ SERVICE INSTANCES ============

export interface ServiceInstanceEntity extends EntityBase {
  space_guid: string;
  service_plan_guid: string;
  type: 'managed_service_instance' | 'user_provided_service_instance';
  credentials?: Record<string, any>;
  tags?: string[];
  syslog_drain_url?: string;
  route_service_url?: string;
  parameters?: Record<string, any>;
}

export interface CreateServiceInstanceOptions {
  name: string;
  space_guid: string;
  service_plan_guid: string;
  parameters?: Record<string, any>;
  tags?: string[];
}

export declare class ServiceInstances extends CloudControllerBase {
  getServiceInstances(filter?: ListResourceParams): Promise<CloudFoundryResponse<ServiceInstanceEntity>>;
  getServiceInstance(serviceInstanceGuid: string): Promise<ServiceInstanceEntity>;
  create(options: CreateServiceInstanceOptions): Promise<ServiceInstanceEntity>;
  update(serviceInstanceGuid: string, options: Partial<CreateServiceInstanceOptions>): Promise<ServiceInstanceEntity>;
  delete(serviceInstanceGuid: string): Promise<void>;
}
```

#### ServiceBindings

```typescript
// ============ SERVICE BINDINGS ============

export interface ServiceBindingEntity extends EntityBase {
  app_guid: string;
  service_instance_guid: string;
  credentials?: Record<string, any>;
  binding_options?: Record<string, any>;
  gateway_data?: Record<string, any>;
  syslog_drain_url?: string;
  volume_mounts?: any[];
}

export interface CreateServiceBindingOptions {
  app_guid: string;
  service_instance_guid: string;
  parameters?: Record<string, any>;
}

export declare class ServiceBindings extends CloudControllerBase {
  getBindings(filter?: ListResourceParams): Promise<CloudFoundryResponse<ServiceBindingEntity>>;
  getBinding(bindingGuid: string): Promise<ServiceBindingEntity>;
  create(options: CreateServiceBindingOptions): Promise<ServiceBindingEntity>;
  delete(bindingGuid: string): Promise<void>;
}
```

#### Other Model Classes

```typescript
// ============ OTHER MODELS ============

export interface BuildPackEntity extends EntityBase {
  position: number;
  enabled: boolean;
  locked: boolean;
  filename?: string;
}

export declare class BuildPacks extends CloudControllerBase {
  getBuildpacks(filter?: ListResourceParams): Promise<CloudFoundryResponse<BuildPackEntity>>;
  getBuildpack(buildpackGuid: string): Promise<BuildPackEntity>;
  create(options: CreateBuildPackOptions): Promise<BuildPackEntity>;
  update(buildpackGuid: string, options: Partial<CreateBuildPackOptions>): Promise<BuildPackEntity>;
  delete(buildpackGuid: string): Promise<void>;
}

export interface CreateBuildPackOptions {
  name: string;
  position: number;
  enabled?: boolean;
  locked?: boolean;
}

export interface DomainEntity extends EntityBase {
  name: string;
  owning_organization_guid?: string;
  wildcard: boolean;
  internal: boolean;
}

export declare class Domains extends CloudControllerBase {
  getDomains(filter?: ListResourceParams): Promise<CloudFoundryResponse<DomainEntity>>;
  getDomain(domainGuid: string): Promise<DomainEntity>;
  create(options: CreateDomainOptions): Promise<DomainEntity>;
  delete(domainGuid: string): Promise<void>;
}

export interface CreateDomainOptions {
  name: string;
  owning_organization_guid?: string;
  wildcard?: boolean;
}

export declare class Events extends CloudControllerBase {
  getEvents(filter?: ListResourceParams): Promise<CloudFoundryResponse<any>>;
  getEvent(eventGuid: string): Promise<any>;
}

export declare class Jobs extends CloudControllerBase {
  getJobs(filter?: ListResourceParams): Promise<CloudFoundryResponse<any>>;
}

export interface QuotaEntity extends EntityBase {
  memory_limit: number;
  instance_memory_limit: number;
  total_services: number;
  total_routes: number;
}

export declare class OrganizationsQuota extends CloudControllerBase {
  getQuotas(filter?: ListResourceParams): Promise<CloudFoundryResponse<QuotaEntity>>;
  getQuota(quotaGuid: string): Promise<QuotaEntity>;
}

export declare class SpacesQuota extends CloudControllerBase {
  getQuotas(filter?: ListResourceParams): Promise<CloudFoundryResponse<QuotaEntity>>;
  getQuota(quotaGuid: string): Promise<QuotaEntity>;
}

export interface StackEntity extends EntityBase {
  description: string;
}

export declare class Stacks extends CloudControllerBase {
  getStacks(filter?: ListResourceParams): Promise<CloudFoundryResponse<StackEntity>>;
  getStack(stackGuid: string): Promise<StackEntity>;
}

export interface UserEntity extends EntityBase {
  active: boolean;
  verified: boolean;
}

export declare class Users extends CloudControllerBase {
  getUsers(filter?: ListResourceParams): Promise<CloudFoundryResponse<UserEntity>>;
  getUser(userGuid: string): Promise<UserEntity>;
  create(options: CreateUserOptions): Promise<UserEntity>;
  delete(userGuid: string): Promise<void>;
}

export interface CreateUserOptions {
  username: string;
  password?: string;
  emails?: Array<{ value: string }>;
  active?: boolean;
}

export declare class UserProvidedServices extends CloudControllerBase {
  getServices(filter?: ListResourceParams): Promise<CloudFoundryResponse<ServiceInstanceEntity>>;
  getService(serviceGuid: string): Promise<ServiceInstanceEntity>;
  create(options: CreateUserProvidedServiceOptions): Promise<ServiceInstanceEntity>;
  update(serviceGuid: string, options: Partial<CreateUserProvidedServiceOptions>): Promise<ServiceInstanceEntity>;
  delete(serviceGuid: string): Promise<void>;
}

export interface CreateUserProvidedServiceOptions {
  name: string;
  space_guid: string;
  credentials?: Record<string, any>;
  syslog_drain_url?: string;
  route_service_url?: string;
  tags?: string[];
}

export interface ServicePlanEntity extends EntityBase {
  service_guid: string;
  public: boolean;
  active: boolean;
  description: string;
  extra?: Record<string, any>;
}

export declare class ServicePlans extends CloudControllerBase {
  getPlans(filter?: ListResourceParams): Promise<CloudFoundryResponse<ServicePlanEntity>>;
  getPlan(planGuid: string): Promise<ServicePlanEntity>;
}
```

---

### Step 2.4: Create Metrics Types (Logs)

**Location**: `types/index.d.ts` (append)

```typescript
// ============ METRICS/LOGS ============

export interface LogStreamOptions {
  recent?: boolean;
  follow?: boolean;
}

export declare class Logs {
  LOG_API_URL: string;
  UAA_TOKEN: OAuthToken;
  
  setEndPoint(endPoint: string): void;
  setToken(token: OAuthToken): void;
  getRecent(appGuid: string): Promise<string>;
  stream(appGuid: string): any; // WebSocket or similar stream
}
```

---

### Step 2.5: Create UAA Types

**Location**: `types/index.d.ts` (append)

```typescript
// ============ UAA/USERS ============

export interface UAAUser extends EntityBase {
  username: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  active: boolean;
  verified: boolean;
  emails?: Array<{ value: string; primary?: boolean }>;
  groups?: Array<{ value: string; display: string }>;
}

export interface CreateUAAUserOptions {
  username: string;
  password?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  active?: boolean;
}

export declare class UsersUAA {
  UAA_ENDPOINT: string;
  UAA_TOKEN: OAuthToken;
  
  constructor(endPoint: string);
  
  setToken(token: OAuthToken): void;
  setEndPoint(endPoint: string): void;
  getUser(userGuid: string): Promise<UAAUser>;
  getUsers(filter?: ListResourceParams): Promise<CloudFoundryResponse<UAAUser>>;
  create(options: CreateUAAUserOptions): Promise<UAAUser>;
  update(userGuid: string, options: Partial<CreateUAAUserOptions>): Promise<UAAUser>;
  delete(userGuid: string): Promise<void>;
}
```

---

### Step 2.6: Create Utility Types

**Location**: `types/index.d.ts` (append)

```typescript
// ============ UTILITIES ============

export namespace HttpStatus {
  export const OK: 200;
  export const CREATED: 201;
  export const BAD_REQUEST: 400;
  export const UNAUTHORIZED: 401;
  export const FORBIDDEN: 403;
  export const NOT_FOUND: 404;
  export const CONFLICT: 409;
  export const UNPROCESSABLE_ENTITY: 422;
  export const INTERNAL_SERVER_ERROR: 500;
  export const SERVICE_UNAVAILABLE: 503;
  export const [key: string]: number;
}

export namespace HttpMethods {
  export const GET: 'GET';
  export const POST: 'POST';
  export const PUT: 'PUT';
  export const PATCH: 'PATCH';
  export const DELETE: 'DELETE';
  export const HEAD: 'HEAD';
  export const OPTIONS: 'OPTIONS';
  export const TRACE: 'TRACE';
}

export interface HttpResponse<T = any> {
  statusCode: number;
  body: T;
  headers: Record<string, string>;
}

export declare class HttpUtils {
  request(options: RequestOptions, expectedStatusCode: number, json?: boolean): Promise<any>;
}
```

---

### Step 2.7: Update Package Exports

**Location**: `types/index.d.ts` (append at end)

```typescript
// ============ MAIN EXPORTS ============

export interface CFClientOptions {
  endpoint: string;
  apiVersion?: 'v2' | 'v3';
  logEndpoint?: string;
  uaaEndpoint?: string;
}

export declare class CloudFoundryClient {
  apps: Apps;
  buildPacks: BuildPacks;
  cloudController: CloudController;
  domains: Domains;
  events: Events;
  jobs: Jobs;
  logs: Logs;
  organizations: Organizations;
  organizationQuotas: OrganizationsQuota;
  routes: Routes;
  serviceBindings: ServiceBindings;
  serviceInstances: ServiceInstances;
  servicePlans: ServicePlans;
  services: Services;
  spaces: Spaces;
  spacesQuotas: SpacesQuota;
  stacks: Stacks;
  userProvidedServices: UserProvidedServices;
  users: Users;
  usersUAA: UsersUAA;
  logs: Logs;
  
  constructor(options: CFClientOptions);
  
  setToken(token: OAuthToken): void;
}
```

## Checklist

- [ ] Base types defined (CloudFoundryResponse, OAuthToken, etc.)
- [ ] CloudControllerBase types created
- [ ] Apps types with all methods documented
- [ ] Spaces types created
- [ ] Organizations types created
- [ ] Routes types created
- [ ] Services types created
- [ ] ServiceInstances types created
- [ ] ServiceBindings types created
- [ ] BuildPacks types created
- [ ] Domains types created
- [ ] Events types created
- [ ] Jobs types created
- [ ] OrganizationsQuota types created
- [ ] SpacesQuota types created
- [ ] Stacks types created
- [ ] Users types created
- [ ] UserProvidedServices types created
- [ ] ServicePlans types created
- [ ] Logs types created
- [ ] UsersUAA types created
- [ ] HttpStatus/HttpMethods/HttpUtils types created
- [ ] Package exports defined
- [ ] npm run build passes without errors
- [ ] types/index.d.ts compiles cleanly

## Next Phase

Proceed to [Phase 3: Update Configuration Files](./phase-03-update-configuration-files.md)

---

*Est. Completion Time*: 2-3 hours  
*Files Modified*: types/index.d.ts  
*Code Size*: ~800-1000 lines of TypeScript declarations
