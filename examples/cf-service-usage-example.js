/* eslint-disable no-console, valid-jsdoc, jsdoc/require-description, jsdoc/require-param-description, jsdoc/require-returns-description */
"use strict";

// =============================================================================
// cf-node-client — Comprehensive Usage Examples
//
// This file demonstrates ALL convenience methods and common usage patterns
// for the Cloud Foundry Node.js client library.
// =============================================================================

const CloudController = require("cf-node-client").CloudController;
const UsersUAA = require("cf-node-client").UsersUAA;
const Organizations = require("cf-node-client").Organizations;
const Spaces = require("cf-node-client").Spaces;
const Apps = require("cf-node-client").Apps;
const ServiceInstances = require("cf-node-client").ServiceInstances;
const Services = require("cf-node-client").Services;

const apiCF = "https://api.cf.example.com";
const credentials = { username: "user", password: "pass" };

// =============================================================================
// 1. AUTHENTICATION
// =============================================================================

/**
 * Authenticate with Cloud Foundry UAA and obtain an OAuth token.
 * The token is required for all subsequent API calls.
 * @returns {Promise<Object>} OAuth token object
 */
function getAuthToken() {
    const cfController = new CloudController(apiCF);
    const usersUAA = new UsersUAA();

    return cfController.getInfo().then(function (info) {
        usersUAA.setEndPoint(info.authorization_endpoint);
        return usersUAA.login(credentials.username, credentials.password);
    });
}

// =============================================================================
// 2. ORGANIZATIONS — Find by Name / List / Get by GUID
// =============================================================================

/**
 * Example: Find an organization by name (server-side filter, single API call).
 *
 * BEFORE (manual loop):
 *   orgsClient.getOrganizations({page: 1, "results-per-page": 500})
 *       .then(result => result.resources.find(o => o.entity.name === "my-org"));
 *
 * AFTER (convenience method — uses CF API server-side filter):
 *   orgsClient.getOrganizationByName("my-org");
 */
function findOrgByName(token) {
    const orgsClient = new Organizations(apiCF);
    orgsClient.setToken(token);

    return orgsClient.getOrganizationByName("my-org").then(function (org) {
        if (!org) {
            console.log("Organization not found");
            return null;
        }
        // v2: org.entity.name / org.metadata.guid
        // v3: org.name / org.guid
        const name = org.entity ? org.entity.name : org.name;
        const guid = org.metadata ? org.metadata.guid : org.guid;
        console.log("Found org:", name, "guid:", guid);
        return org;
    });
}

/**
 * Example: Get an organization by its GUID directly.
 */
function getOrgByGuid(token, orgGuid) {
    const orgsClient = new Organizations(apiCF);
    orgsClient.setToken(token);

    return orgsClient.getOrganization(orgGuid).then(function (org) {
        console.log("Org details:", org.entity ? org.entity.name : org.name);
        return org;
    });
}

/**
 * Example: List all organizations with pagination.
 */
function listAllOrgs(token) {
    const orgsClient = new Organizations(apiCF);
    orgsClient.setToken(token);

    return orgsClient.getOrganizations({ page: 1 }).then(function (result) {
        console.log("Total orgs:", result.total_results || result.pagination.total_results);
        result.resources.forEach(function (org) {
            const name = org.entity ? org.entity.name : org.name;
            console.log("  -", name);
        });
        return result;
    });
}

// =============================================================================
// 3. SPACES — Find by Name / List / Get by GUID
// =============================================================================

/**
 * Example: Find a space by name, optionally scoped to an organization.
 *
 * getSpaceByName(name)           — find across all orgs
 * getSpaceByName(name, orgGuid)  — find within a specific org (recommended)
 */
function findSpaceByName(token, orgGuid) {
    const spacesClient = new Spaces(apiCF);
    spacesClient.setToken(token);

    // With org filter (recommended — avoids ambiguity when multiple orgs have same space name)
    return spacesClient.getSpaceByName("dev", orgGuid).then(function (space) {
        if (!space) {
            console.log("Space not found");
            return null;
        }
        const name = space.entity ? space.entity.name : space.name;
        const guid = space.metadata ? space.metadata.guid : space.guid;
        console.log("Found space:", name, "guid:", guid);
        return space;
    });
}

/**
 * Example: Get a space by its GUID directly.
 */
function getSpaceByGuid(token, spaceGuid) {
    const spacesClient = new Spaces(apiCF);
    spacesClient.setToken(token);

    return spacesClient.getSpace(spaceGuid).then(function (space) {
        console.log("Space details:", space.entity ? space.entity.name : space.name);
        return space;
    });
}

/**
 * Example: List all spaces.
 */
function listAllSpaces(token) {
    const spacesClient = new Spaces(apiCF);
    spacesClient.setToken(token);

    return spacesClient.getSpaces({ page: 1 }).then(function (result) {
        console.log("Total spaces:", result.total_results || result.pagination.total_results);
        result.resources.forEach(function (space) {
            console.log("  -", space.entity ? space.entity.name : space.name);
        });
        return result;
    });
}

// =============================================================================
// 4. APPS — Find by Name / List / Get by GUID / Lifecycle
// =============================================================================

/**
 * Example: Find an app by name, optionally scoped to a space.
 *
 * getAppByName(name)              — find across all spaces
 * getAppByName(name, spaceGuid)   — find within a specific space (recommended)
 */
function findAppByName(token, spaceGuid) {
    const appsClient = new Apps(apiCF);
    appsClient.setToken(token);

    return appsClient.getAppByName("my-app", spaceGuid).then(function (app) {
        if (!app) {
            console.log("App not found");
            return null;
        }
        const name = app.entity ? app.entity.name : app.name;
        const guid = app.metadata ? app.metadata.guid : app.guid;
        console.log("Found app:", name, "guid:", guid);
        return app;
    });
}

/**
 * Example: Get an app by its GUID directly.
 */
function getAppByGuid(token, appGuid) {
    const appsClient = new Apps(apiCF);
    appsClient.setToken(token);

    return appsClient.getApp(appGuid).then(function (app) {
        console.log("App details:", app.entity ? app.entity.name : app.name);
        return app;
    });
}

/**
 * Example: Start / Stop / Restart an app.
 */
function appLifecycle(token, appGuid) {
    const appsClient = new Apps(apiCF);
    appsClient.setToken(token);

    return appsClient.stop(appGuid)
        .then(function () { console.log("App stopped"); })
        .then(function () { return appsClient.start(appGuid); })
        .then(function () { console.log("App started"); })
        .then(function () { return appsClient.restart(appGuid); })
        .then(function () { console.log("App restarted"); });
}

/**
 * Example: List all apps with a filter.
 */
function listAllApps(token) {
    const appsClient = new Apps(apiCF);
    appsClient.setToken(token);

    return appsClient.getApps({ page: 1 }).then(function (result) {
        console.log("Total apps:", result.total_results || result.pagination.total_results);
        result.resources.forEach(function (app) {
            console.log("  -", app.entity ? app.entity.name : app.name);
        });
        return result;
    });
}

// =============================================================================
// 5. SERVICE INSTANCES — Find by Name / List / Get by GUID
// =============================================================================

/**
 * Example: Find a service instance by name, optionally scoped to a space.
 *
 * getInstanceByName(name)              — find across all spaces
 * getInstanceByName(name, spaceGuid)   — find within a specific space (recommended)
 */
function findServiceInstanceByName(token, spaceGuid) {
    const siClient = new ServiceInstances(apiCF);
    siClient.setToken(token);

    return siClient.getInstanceByName("my-database", spaceGuid).then(function (instance) {
        if (!instance) {
            console.log("Service instance not found");
            return null;
        }
        const name = instance.entity ? instance.entity.name : instance.name;
        const guid = instance.metadata ? instance.metadata.guid : instance.guid;
        console.log("Found service instance:", name, "guid:", guid);
        return instance;
    });
}

/**
 * Example: Get a service instance by its GUID directly.
 */
function getServiceInstanceByGuid(token, instanceGuid) {
    const siClient = new ServiceInstances(apiCF);
    siClient.setToken(token);

    return siClient.getInstance(instanceGuid).then(function (instance) {
        console.log("Instance details:", instance.entity ? instance.entity.name : instance.name);
        return instance;
    });
}

// =============================================================================
// 6. API V2 vs V3 — Version Switching
// =============================================================================

/**
 * Example: Use API v2 mode for legacy platforms.
 * By default, all clients use v3. Pass { apiVersion: "v2" } to use v2.
 */
function usingV2Api(token) {
    const orgsV2 = new Organizations(apiCF, { apiVersion: "v2" });
    orgsV2.setToken(token);

    return orgsV2.getOrganizationByName("my-org").then(function (org) {
        if (!org) { return; }
        // v2 response shape: org.entity.name, org.metadata.guid
        console.log("[v2] Found org:", org.entity.name, "guid:", org.metadata.guid);
    });
}

/**
 * Example: Use API v3 (default) — resources are flat objects.
 */
function usingV3Api(token) {
    const orgsV3 = new Organizations(apiCF); // v3 is default
    orgsV3.setToken(token);

    return orgsV3.getOrganizationByName("my-org").then(function (org) {
        if (!org) { return; }
        // v3 response shape: org.name, org.guid (flat)
        console.log("[v3] Found org:", org.name, "guid:", org.guid);
    });
}

// =============================================================================
// 8. AUTO-PAGINATION — getAllResources
// =============================================================================

/**
 * Example: Fetch ALL organizations across every page (auto-pagination).
 *
 * BEFORE (manual loop):
 *   let allOrgs = [];
 *   let page = 1, hasMore = true;
 *   while (hasMore) {
 *       const res = await orgsClient.getOrganizations({ page });
 *       allOrgs = allOrgs.concat(res.resources);
 *       hasMore = !!res.next_url || !!(res.pagination && res.pagination.next);
 *       page++;
 *   }
 *
 * AFTER (built-in):
 *   const allOrgs = await orgsClient.getAllOrganizations();
 */
function getAllOrgsExample() {
    return getAuthToken().then(function (token) {
        const orgsClient = new Organizations(apiCF);
        orgsClient.setToken(token);

        // One call — library pages through everything automatically
        return orgsClient.getAllOrganizations().then(function (allOrgs) {
            console.log("Total organizations:", allOrgs.length);
            allOrgs.forEach(function (org) {
                console.log(" -", org.entity ? org.entity.name : org.name);
            });
        });
    });
}

/**
 * Example: Fetch ALL spaces, optionally with a filter.
 */
function getAllSpacesExample() {
    return getAuthToken().then(function (token) {
        const spacesClient = new Spaces(apiCF);
        spacesClient.setToken(token);

        // No filter — all spaces across every page
        return spacesClient.getAllSpaces().then(function (allSpaces) {
            console.log("Total spaces:", allSpaces.length);
        });
    });
}

/**
 * Example: Fetch ALL apps with a filter (e.g. a specific org/space).
 */
function getAllAppsWithFilterExample() {
    return getAuthToken().then(function (token) {
        const appsClient = new Apps(apiCF);
        appsClient.setToken(token);

        // Filter: only apps in a specific space (works with v2 query and v3 params)
        return appsClient.getAllApps({ q: "space_guid:my-space-guid" }).then(function (allApps) {
            console.log("Total apps in space:", allApps.length);
        });
    });
}

/**
 * Example: Fetch ALL service instances.
 */
function getAllInstancesExample() {
    return getAuthToken().then(function (token) {
        const si = new ServiceInstances(apiCF);
        si.setToken(token);

        return si.getAllInstances().then(function (allInstances) {
            console.log("Total service instances:", allInstances.length);
        });
    });
}

// =============================================================================
// 9. MEMORY CACHE — Reduce redundant API calls
// =============================================================================

/**
 * Example: Enable the built-in memory cache via constructor options.
 * The cache is opt-in. Default TTL is 30 000 ms (30 s).
 *
 *   const orgsClient = new Organizations(api, { cache: true, cacheTTL: 60000 });
 *
 * Subsequent identical calls within the TTL window return the cached result
 * without making a new HTTP request to Cloud Controller.
 */
function cacheViaConstructorExample() {
    return getAuthToken().then(function (token) {
        // Enable cache with 60 s TTL at construction time
        const orgsClient = new Organizations(apiCF, { cache: true, cacheTTL: 60000 });
        orgsClient.setToken(token);

        // First call hits the API
        return orgsClient.getAllOrganizations().then(function (first) {
            console.log("First call (API):", first.length, "orgs");
            // Second call within 60 s returns from cache — zero HTTP calls
            return orgsClient.getAllOrganizations();
        }).then(function (second) {
            console.log("Second call (cache):", second.length, "orgs");
        });
    });
}

/**
 * Example: Enable/disable cache at runtime.
 */
function cacheRuntimeToggleExample() {
    return getAuthToken().then(function (token) {
        const spacesClient = new Spaces(apiCF);
        spacesClient.setToken(token);

        // Turn cache on at runtime (default 30 s TTL)
        spacesClient.enableCache();
        console.log("Cache enabled");

        return spacesClient.getAllSpaces().then(function (spaces) {
            console.log("Spaces (cached):", spaces.length);

            // Manually clear cache to force fresh data on next call
            spacesClient.clearCache();
            console.log("Cache cleared");

            return spacesClient.getAllSpaces();
        }).then(function (fresh) {
            console.log("Spaces (fresh):", fresh.length);

            // Turn cache off entirely
            spacesClient.disableCache();
            console.log("Cache disabled");
        });
    });
}

// =============================================================================
// 10. FULL WORKFLOW — Authenticate → Org → Space → App → Start
// =============================================================================

/**
 * Complete example: Find org → find space → find app → start app.
 * Shows the clean chaining pattern using convenience methods.
 */
function fullWorkflow() {
    return getAuthToken()
        .then(function (token) {
            const orgsClient = new Organizations(apiCF);
            const spacesClient = new Spaces(apiCF);
            const appsClient = new Apps(apiCF);

            orgsClient.setToken(token);
            spacesClient.setToken(token);
            appsClient.setToken(token);

            return orgsClient.getOrganizationByName("my-org")
                .then(function (org) {
                    if (!org) { throw new Error("Organization 'my-org' not found"); }
                    const orgGuid = org.metadata ? org.metadata.guid : org.guid;
                    return spacesClient.getSpaceByName("dev", orgGuid);
                })
                .then(function (space) {
                    if (!space) { throw new Error("Space 'dev' not found"); }
                    const spaceGuid = space.metadata ? space.metadata.guid : space.guid;
                    return appsClient.getAppByName("my-app", spaceGuid);
                })
                .then(function (app) {
                    if (!app) { throw new Error("App 'my-app' not found"); }
                    const appGuid = app.metadata ? app.metadata.guid : app.guid;
                    console.log("Starting app:", app.entity ? app.entity.name : app.name);
                    return appsClient.start(appGuid);
                })
                .then(function () {
                    console.log("App started successfully!");
                });
        })
        .catch(function (err) {
            console.error("CF Error:", err.message);
        });
}

// =============================================================================
// 11. CONVENIENCE METHODS SUMMARY
// =============================================================================
//
// ┌──────────────────────┬──────────────────────────────────────────────────────┐
// │ Method               │ Description                                          │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ FIND BY NAME         │ Server-side filter — single API call, returns        │
// │                      │ first match or null                                  │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ orgs.getOrganization │ Find org by name                                     │
// │   ByName(name)       │   v2: q=name:{name}  /  v3: names={name}            │
// │                      │                                                      │
// │ spaces.getSpaceByNam │ Find space by name, optionally within org            │
// │   e(name, orgGuid?)  │   v2: q=name:{name}  /  v3: names={name}            │
// │                      │                                                      │
// │ apps.getAppByName    │ Find app by name, optionally within space            │
// │   (name, spaceGuid?) │   v2: q=name:{name}  /  v3: names={name}            │
// │                      │                                                      │
// │ si.getInstanceByName │ Find service instance by name, optionally in space   │
// │   (name, spaceGuid?) │   v2: q=name:{name}  /  v3: names={name}            │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ GET ALL (paginated)  │ Auto-paginate — returns flat array of all resources  │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ orgs.getAllOrganizat  │ Get every org (v2 + v3 pagination handled)           │
// │   ions(filter?)      │                                                      │
// │ spaces.getAllSpaces   │ Get every space                                      │
// │   (filter?)          │                                                      │
// │ apps.getAllApps       │ Get every app                                        │
// │   (filter?)          │                                                      │
// │ si.getAllInstances    │ Get every service instance                           │
// │   (filter?)          │                                                      │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ CACHE                │ In-memory cache to reduce repeated API calls         │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ client.enableCache   │ Turn cache on at runtime (optional TTL ms)           │
// │   (ttlMs?)           │                                                      │
// │ client.disableCache()│ Turn cache off and clear all entries                 │
// │ client.clearCache()  │ Clear entries but keep cache enabled                 │
// │                      │                                                      │
// │ Constructor option:  │ new Organizations(api, { cache: true,                │
// │                      │   cacheTTL: 60000 })                                 │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ GET BY GUID          │ Direct lookup — single API call                      │
// ├──────────────────────┼──────────────────────────────────────────────────────┤
// │ orgs.getOrganization │ Get org by GUID                                      │
// │   (guid)             │                                                      │
// │ spaces.getSpace(guid)│ Get space by GUID                                    │
// │ apps.getApp(guid)    │ Get app by GUID                                      │
// │ si.getInstance(guid) │ Get service instance by GUID                         │
// └──────────────────────┴──────────────────────────────────────────────────────┘
//

// ─── Run full workflow ─────────────────────────────────────────────────────────
fullWorkflow();
