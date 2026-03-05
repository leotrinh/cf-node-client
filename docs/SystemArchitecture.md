# System Architecture

## Overview

Cloud Foundry Node.js client — a lightweight library wrapping the CF API v2 and v3.
All model classes inherit from a single base class (`CloudControllerBase`) that provides endpoint management, token storage, HTTP utilities, and v2/v3 routing.

## Project Structure

```
cf-nodejs-client/
├── index.js                 # Public entry point — re-exports all models
├── lib/
│   ├── model/
│   │   ├── cloudcontroller/     # CF API v2/v3 model classes
│   │   │   ├── CloudControllerBase.js   # Base class (shared by ALL models)
│   │   │   ├── CloudController.js       # /v2/info, /v3 root
│   │   │   ├── Apps.js                  # Facade → AppsCore + AppsDeployment + AppsCopy
│   │   │   ├── AppsCore.js              # CRUD, lifecycle (start/stop/restart)
│   │   │   ├── AppsDeployment.js        # Upload, stats, routes, env vars, restage
│   │   │   ├── AppsCopy.js              # Copy bits/packages, download bits/droplets
│   │   │   ├── BuildPacks.js            # Buildpack CRUD + well-known URL map
│   │   │   ├── Domains.js               # Domain management
│   │   │   ├── Events.js                # Audit events
│   │   │   ├── Jobs.js                  # Background jobs (v2) / tasks (v3)
│   │   │   ├── Organizations.js         # Org management
│   │   │   ├── OrganizationsQuota.js    # Org quota definitions
│   │   │   ├── Routes.js                # Route management
│   │   │   ├── ServiceBindings.js       # Service binding CRUD
│   │   │   ├── ServiceInstances.js      # Managed/user-provided instances
│   │   │   ├── ServicePlans.js          # Service plan queries
│   │   │   ├── Services.js              # Service broker queries
│   │   │   ├── Spaces.js               # Space management
│   │   │   ├── SpacesQuota.js           # Space quota definitions
│   │   │   ├── Stacks.js               # Stack queries
│   │   │   ├── UserProvidedServices.js  # User-provided service CRUD
│   │   │   └── Users.js                # CF user/role management
│   │   ├── metrics/
│   │   │   └── Logs.js                  # Log retrieval & parsing (extends base)
│   │   └── uaa/
│   │       └── UsersUAA.js              # UAA OAuth login, token, user CRUD (extends base)
│   ├── utils/
│   │   ├── HttpUtils.js        # HTTP client (node-fetch + form-data)
│   │   ├── HttpStatus.js       # Status code constants
│   │   └── CfIgnoreHelper.js   # .cfignore file parser
│   ├── services/
│   │   └── CacheService.js     # In-memory cache with per-entry TTL
│   └── config/
│       └── HttpMethods.js      # HTTP method constants
├── test/                       # Mocha + Chai test suites
├── types/
│   └── index.d.ts              # TypeScript declarations
└── docs/                       # Documentation
```

## Inheritance Hierarchy

```
CloudControllerBase
 ├── CloudController
 ├── AppsCore ─────────┐
 ├── AppsDeployment ───┤ (mixed into Apps facade)
 ├── AppsCopy ─────────┘
 ├── BuildPacks
 ├── Domains
 ├── Events
 ├── Jobs
 ├── Logs
 ├── Organizations
 ├── OrganizationsQuota
 ├── Routes
 ├── ServiceBindings
 ├── ServiceInstances
 ├── ServicePlans
 ├── Services
 ├── Spaces
 ├── SpacesQuota
 ├── Stacks
 ├── UserProvidedServices
 ├── Users
 └── UsersUAA
```

## Core Patterns

### Base Class (`CloudControllerBase`)

Every model extends this class. It provides:

| Property / Method          | Purpose                                     |
|---------------------------|---------------------------------------------|
| `this.API_URL`            | CF endpoint (set via `setEndPoint()`)       |
| `this.UAA_TOKEN`          | OAuth token object (`access_token`, `token_type`, `refresh_token`) |
| `this.REST`               | `HttpUtils` singleton for HTTP requests     |
| `this.HttpStatus`         | Status code constants (OK, CREATED, etc.)   |
| `getAuthorizationHeader()`| Returns `"Bearer <access_token>"` string    |
| `setEndPoint(url)`        | Validates and stores API URL                |
| `setToken(token)`         | Stores UAA token object                     |
| `isUsingV3()`             | Checks if v3 API mode is enabled            |
| `buildResourceUrl(type, guid?)` | Builds `/v3/<type>[/<guid>]` URL      |
| `getAllResources(fetchFn, filter?)` | Auto-paginate all pages, return flat array |
| `enableCache(ttlMs?)`     | Enable in-memory cache (default 30 s)       |
| `disableCache()`          | Disable cache and clear all entries         |
| `clearCache()`            | Clear cache entries (cache stays on)        |

### Cache Layer (`CacheService`)

Opt-in Map-based in-memory cache with per-entry TTL. Integrated into `CloudControllerBase` through `_cachedFetch()`. Used by `getAllResources()` to avoid repeat pagination calls.

### HTTP Layer (`HttpUtils`)

- Uses `node-fetch` v2 for all HTTP requests (replaced legacy `request` module)
- Uses `form-data` for multipart uploads
- Static `HttpUtils.file()` helper for file upload metadata
- Two request patterns:
  - `request(options, expectedStatus, parseJson)` — v2 style with full options object
  - `requestV3(method, url, token, data, expectedStatus)` — simplified v3 helper
  - `upload(url, options, expectedStatus, parseJson)` — multipart file uploads

### Authentication

- **CF API calls**: `this.getAuthorizationHeader()` → `"Bearer <token>"`
- **UAA login**: Basic auth (`client_id:client_secret` base64)
- **File uploads**: `this.UAA_TOKEN.access_token` passed directly to upload options

### v2 / v3 Dual Support

Models detect API version via `this.isUsingV3()` and route to the correct endpoint:
- v2: `/v2/<resource>` — uses `form` body encoding, status CREATED for writes
- v3: `/v3/<resource>` — uses JSON body, uses PATCH for updates

### Apps Split Architecture

`Apps.js` is a **facade** that combines three focused sub-modules:

```javascript
class Apps extends AppsCore {}    // inherits CRUD + lifecycle
mixin(Apps, AppsDeployment);      // adds deployment, runtime, env methods
mixin(Apps, AppsCopy);            // adds copy + download methods
```

External code uses `new Apps()` as before — fully backward-compatible.

## Data Flow

```
Consumer code
    │
    ▼
index.js (exports all models)
    │
    ▼
Model class (e.g., Apps, Spaces, Domains)
    │  extends CloudControllerBase
    │  uses this.REST (HttpUtils)
    │
    ▼
HttpUtils  ──→  node-fetch  ──→  CF API / UAA endpoint
```

## Testing

- **Framework**: Mocha 2.3.4 + Chai 3.4.1
- **Pattern**: Nock-free unit tests validating class construction and method availability
- **Location**: `test/lib/model/` mirrors `lib/model/` structure
- **Run**: `npm test` (47 tests)
