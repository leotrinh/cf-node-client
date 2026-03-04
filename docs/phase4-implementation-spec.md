# Phase 4 Implementation: Cloud Controller Models v3 Support

## Overview
This document provides the detailed implementation specification for updating all remaining Cloud Controller models to support both v2 and v3 APIs.

The pattern established in `Apps.js` should be followed for consistency and maintainability.

---

## Standard Implementation Pattern

### Template Structure

```javascript
"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * [Resource Name] Management
 * Supports both Cloud Foundry API v2 and v3 (default: v3)
 */
class ResourceName extends CloudControllerBase {

    /**
     * Constructor - inherits API version config from CloudControllerBase
     */
    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Public method - routes to v2 or v3 implementation
     * Pattern: All public methods check API version and delegate
     */
    publicMethod(params) {
        const token = `${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}`;

        if (this.isUsingV3()) {
            return this._publicMethodV3(params, token);
        } else {
            return this._publicMethodV2(params, token);
        }
    }

    /**
     * Private v2 implementation
     * Pattern: Use /v2/resource endpoints, form-urlencoded
     */
    _publicMethodV2(params, token) {
        const url = `${this.API_URL}/v2/resource-endpoint`;
        const options = {
            method: "GET", // or POST, PUT, DELETE
            url: url,
            headers: {
                Authorization: token
                // v2 specific headers if needed
            }
            // v2 specific options (qs for query string, form for body)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Private v3 implementation
     * Pattern: Use /v3/resource endpoints, JSON
     */
    _publicMethodV3(params, token) {
        const url = this.buildResourceUrl("resourceName", resourceId);
        // Alternative: const url = `${this.API_URL}/v3/resource-endpoint`;

        const options = {
            method: "GET", // or POST, PATCH, DELETE
            url: url,
            headers: {
                "Content-Type": "application/json",
                Authorization: token
                // v3 specific headers if needed
            }
            // v3 specific options (body for JSON)
        };

        return this.REST.request(options, this.HttpStatus.OK, true);
    }
}

module.exports = ResourceName;
```

---

## Models Implementation Specifications

### Tier 1: Core Models

#### 1. Organizations.js

**Current Methods to Update:**
- `getOrganizations(filter?)`
- `getMemoryUsage(guid)`
- `getSummary(guid)`
- `getPrivateDomains(guid)`
- `add(options)`
- `remove(guid, options)`
- `getUsers(guid, filter?)`

**v2 → v3 Mapping:**

| Method | v2 Endpoint | v3 Endpoint | Changes |
|--------|-------------|-------------|---------|
| getOrganizations | `/v2/organizations` | `/v3/organizations` | Query params same |
| getMemoryUsage | `/v2/organizations/:id/memory_usage` | `/v3/organizations/:id/memory_usage` | Same structure |
| getSummary | `/v2/organizations/:id/summary` | `/v3/organizations/:id/summary` | Same structure |
| getPrivateDomains | `/v2/organizations/:id/private_domains` | `/v3/private_domains?organization_guids=:id` | Query-based in v3 |
| add | POST `/v2/organizations` | POST `/v3/organizations` | JSON format |
| remove | DELETE `/v2/organizations/:id` | DELETE `/v3/organizations/:id` | Same |
| getUsers | `/v2/organizations/:id/users` | `/v3/organizations/:id/relationships/users` | Relationship in v3 |

**Special Handling:**
- `getPrivateDomains()`: In v3, domains are queried via filter, not nested endpoint
- `getUsers()`: In v3, returns relationships not full user objects

**Implementation Priority:** HIGH (core resource)

---

#### 2. Spaces.js

**Current Methods to Update:**
- `getSpaces(filter?)`
- `getSpaceByName(spaceName, organizationGuid)`
- `add(options)`
- `update(spaceGuid, options)`
- `remove(spaceGuid, options)`
- `getSpaceSummary(spaceGuid)`
- `getApps(spaceGuid, filter?)`
- `getServices(spaceGuid, filter?)`
- `getServiceInstances(spaceGuid, filter?)`
- `getOrganization(spaceGuid)`
- `getUserRoles(spaceGuid, filter?)`
- `getAuditorsAmount(spaceGuid)`

**v2 → v3 Mapping:**

| Method | v2 Endpoint | v3 Endpoint | Changes |
|--------|-------------|-------------|---------|
| getSpaces | `/v2/spaces` | `/v3/spaces` | Query same |
| getSpaceByName | Query `/v2/spaces` | Query `/v3/spaces?names=name` | Query parameter |
| add | POST `/v2/spaces` | POST `/v3/spaces` | JSON format, relationships |
| update | PUT `/v2/spaces/:id` | PATCH `/v3/spaces/:id` | HTTP PATCH method |
| remove | DELETE `/v2/spaces/:id` | DELETE `/v3/spaces/:id` | Same |
| getSpaceSummary | `/v2/spaces/:id/summary` | `/v3/spaces/:id/summary` | Same |
| getApps | `/v2/spaces/:id/apps` | `/v3/apps?space_guids=:id` | Query-based |
| getServices | `/v2/spaces/:id/services` | `/v3/service_offerings?space_guids=:id` | Query-based |
| getServiceInstances | `/v2/spaces/:id/service_instances` | `/v3/service_instances?space_guids=:id` | Query-based |
| getOrganization | `/v2/spaces/:id/organization` | `/v3/spaces/:id/relationships/organization` | Relationship |
| getUserRoles | `/v2/spaces/:id/user_roles` | `/v3/roles?space_guids=:id` | Query-based |
| getAuditorsAmount | Count via `/v2/spaces/:id/auditors` | Count via `/v3/roles` | Query-based |

**Special Handling:**
- Most "list resources in space" endpoints become queries with `space_guids=:id`
- Object relationships accessed via `/relationships/` endpoint
- HTTP PATCH instead of PUT for updates

**Implementation Priority:** HIGH (core resource)

---

#### 3. Services.js

**v2 → v3 Key Differences:**
- v2: `/v2/services`
- v3: `/v3/service_offerings` (main endpoint changed!)
- Still `/v3/services` for certain operations

**Current Methods to Update:**
- `getServices(filter?)`
- `getServicesByBroker(serviceBrokerGuid)`
- `getServicePlans(serviceGuid, filter?)`
- `getServicePlanVisibilities(servicePlanGuid, filter?)`

**v2 → v3 Mapping:**

| Method | v2 Endpoint | v3 Endpoint | Changes |
|--------|-------------|-------------|---------|
| getServices | `/v2/services` | `/v3/service_offerings` | Endpoint renamed! |
| getServicesByBroker | Query `/v2/services?broker_guid=:id` | Query `/v3/service_offerings?service_broker_guids=:id` | Query param |
| getServicePlans | `/v2/services/:id/service_plans` | `/v3/service_plans?service_offering_guids=:id` | Query-based |
| getServicePlanVisibilities | `/v2/service_plan_visibilities` | `/v3/service_plan_visibilities` | Same |

**Special Handling:**
- **CRITICAL:** Services endpoint renamed to `service_offerings`
- Service Plan Visibilities endpoint remains mostly same
- Use `ApiVersionManager.getEndpoint("services")` which maps to correct v3 endpoint

**Implementation Priority:** HIGH (service management)

---

### Tier 2: Supporting Models

#### 4. ServiceInstances.js
- v2: `/v2/service_instances`
- v3: `/v3/service_instances` (similar structure)
- Methods: `getInstances()`, `getInstance()`, `add()`, `update()`, `remove()`, `getServiceBindings()`

#### 5. ServiceBindings.js
- **CRITICAL RENAME:** v2: `/v2/service_bindings` → v3: `/v3/service_credential_bindings`
- Additional v3: `/v3/service_bindings` for different purposes
- Methods: `getBindings()`, `getBinding()`, `add()`, `remove()`, `update()`

#### 6. Routes.js
- v2: `/v2/routes` → v3: `/v3/routes` (mostly compatible)
- Methods: `getRoutes()`, `getRoute()`, `add()`, `remove()`, `getAppsForRoute()`, `associateApp()`

#### 7. Domains.js
- v2: `/v2/domains` → v3: `/v3/domains` (mostly compatible)
- Methods: `getDomains()`, `getDomain()`, `getSharedDomains()`, `getPrivateDomains()`, `add()`, `remove()`

---

### Tier 3: Configuration Models

#### 8. BuildPacks.js
- v2: `/v2/buildpacks` → v3: `/v3/buildpacks`
- Methods: `getBuildPacks()`, `getBuildPack()`, `add()`, `update()`, `remove()`

#### 9. Stacks.js
- v2: `/v2/stacks` → v3: `/v3/stacks`
- Methods: `getStacks()`, `getStack()`

#### 10. Users.js
- v2: `/v2/users` → v3: `/v3/users`
- Methods: `getUsers()`, `getUser()`, `getUserAuditedOrganizations()`, etc.

#### 11. Events.js
- **IMPORTANT RENAME:** v2: `/v2/events` → v3: `/v3/audit_events`
- Methods: `getEvents()`, `getEventsByQuery()`

#### 12. Jobs.js
- v2: `/v2/jobs` → v3: `/v3/jobs`
- Methods: `getJob()`

---

### Tier 4: Quota Models

#### 13. OrganizationsQuota.js
- **ENDPOINT CHANGE**: v2: `/v2/quota_definitions` → v3: `/v3/organization_quotas`
- Methods: `getQuotas()`, `getQuota()`, `add()`, `update()`, `remove()`, `getOrganizations()`

#### 14. SpacesQuota.js
- **ENDPOINT CHANGE**: v2: `/v2/space_quota_definitions` → v3: `/v3/space_quotas`
- Methods: `getQuotas()`, `getQuota()`, `add()`, `update()`, `remove()`

---

### Tier 5: Specialized

#### 15. UserProvidedServices.js
- v2: `/v2/user_provided_service_instances`
- v3: `/v3/user_provided_service_instances` (same!)
- Methods: `getServices()`, `getService()`, `add()`, `update()`, `remove()`, `getServiceBindings()`

---

## Common Data Structure Transformations

### v2 → v3 Field Mapping

**Standard transformations to implement:**

```javascript
// v2 field: foreign key GUID
space_guid: "12345..."

// v3 equivalent: nested relationship
"relationships": {
    "space": {
        "data": {
            "guid": "12345..."
        }
    }
}

// Other common mappings:
organization_guid → relationships.organization.data.guid
service_broker_guid → relationships.service_broker.data.guid
domain_guid → relationships.domain.data.guid
route_guid → relationships.route.data.guid
app_guid → relationships.app.data.guid
plan_guid → relationships.service_plan.data.guid
```

---

## Implementation Checklist for Each Model

```
[ ] Read original v2 methods completely
[ ] List all methods and endpoints
[ ] Create v3 endpoint mapping table
[ ] Implement class with constructor
[ ] Implement each public method with version check
[ ] Implement _MethodV2 with v2 endpoint and format
[ ] Implement _MethodV3 with v3 endpoint and format
[ ] Handle data structure differences
[ ] Test with sample data
[ ] Update JSDoc comments
[ ] Add v3 API reference links
```

---

## Special Considerations by Category

### Quotas: Major Endpoint Changes
- Both quota models have renamed endpoints
- ApiVersionManager already has mappings
- Use builder methods: `buildResourceUrl("organizationQuotas")`

### Services: Critical Rename
- Services → ServiceOfferings in v3
- Requires special attention
- ApiVersionManager ready with mapping

### Relationships: Major Structure Change
- v2: Foreign keys (space_guid)
- v3: Nested objects (relationships.space.data.guid)
- Use ApiVersionManager.getV3FieldName()

### Query-Based Endpoints
- v2 often uses sub-resources: `/v2/spaces/:id/apps`
- v3 often uses queries: `/v3/apps?space_guids=:id`
- Need to handle this in each model

### PATCH vs PUT
- v2: PUT for full replacement
- v3: PATCH for partial updates
- Update methods need different HTTP verbs

---

## Recommended Implementation Order

1. **Start with Organizations.js** (simpler, core)
2. **Then Spaces.js** (similar to Organizations)
3. **Then Services.js** (critical service management)
4. **Then Tier 2 models** (supporting)
5. **Then Tier 3-5 models** (configuration and quotas)

---

## Testing Strategy

For each model, create tests that verify:
1. v2 methods work with v2 endpoints
2. v3 methods work with v3 endpoints
3. API version switching works
4. Field transformations work correctly
5. Error handling works for both versions

---

## Notes for Implementation

- Keep files under 500 lines if possible (split if necessary)
- Use consistent naming: `_methodV2()` and `_methodV3()`
- Always get token: `const token = \`${this.UAA_TOKEN.token_type} ${this.UAA_TOKEN.access_token}\`;`
- Use ApiVersionManager helpers when available
- Document v2 and v3 API reference links in JSDoc
- Maintain backward compatibility completely

---

## Estimated Code Changes per Model

- **Simple models** (Routes, Domains, Stacks, Users): 200-300 lines each
- **Medium models** (Services, ServiceInstances, Events): 300-400 lines each
- **Complex models** (Organizations, Spaces, ServiceBindings, Quotas): 400-500 lines each

**Total estimated code for Phase 4:** 4,000-5,000 lines

---

## Reference: Apps.js Pattern Example

The Apps.js file shows all the patterns in practice:
- Version checking and routing (line ~50-60)
- Private method implementations (V2 and V3)
- Data structure handling
- HTTP method differences (POST, PUT, PATCH)
- Endpoint URL construction
- Error handling for v3-only features

Use it as the definitive reference for implementation patterns.
