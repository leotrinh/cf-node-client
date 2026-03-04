# Implementation Phases: Update cf-nodejs-client to Cloud Foundry API v3

## Phase 1: Create Configuration System & API Version Manager

### Objectives
- Create a configuration system to manage API versions (v2 default, allow v3)
- Create an API Version Manager to route requests to appropriate endpoints

### Files to Create
- `lib/config/ApiConfig.js` - Configuration management for API versions
- `lib/config/ApiVersionManager.js` - Manages v2 vs v3 routing

### Files to Modify
- `lib/model/cloudcontroller/CloudControllerBase.js` - Add API version support

### Details
1. Create ApiConfig.js to store:
   - Default API version (v3)
   - Available API versions (v2, v3)
   - Ability to set API version per instance or globally

2. Create ApiVersionManager.js to:
   - Map v2 endpoints to v3 equivalents
   - Route requests based on configured version
   - Provide helper methods for building endpoint URLs

3. Update CloudControllerBase.js to:
   - Accept API version in constructor
   - Use ApiVersionManager to build URLs

---

## Phase 2: Update Cloud Controller Base & HTTP Utilities

### Objectives
- Update base classes to support both v2 and v3 APIs
- Enhance HTTP utilities to handle both API versions

### Files to Modify
- `lib/utils/HttpUtils.js` - Add v3 request handling
- `lib/model/cloudcontroller/CloudControllerBase.js` - Add API version support

### Details
1. Enhance HttpUtils.js to:
   - Support both form-urlencoded (v2) and JSON (v3) content types
   - Handle v3-specific response structures
   - Add helper methods for v3-specific headers

2. Update CloudControllerBase.js to:
   - Store API version
   - Use ApiVersionManager for URL construction
   - Provide helper methods for building v3 requests

---

## Phase 3: Refactor Apps Model (v2 → v3)

### Objectives
- Update Apps.js to support both v2 and v3 APIs
- Maintain backward compatibility with v2

### Files to Modify
- `lib/model/cloudcontroller/Apps.js`

### Key Changes for v3 (from v2):
- **Endpoints**: `/v2/apps` → `/v3/apps`
- **Request Format**: form-urlencoded → JSON
- **Response Structure**: Different field names and structure
- **Main Methods to Update**:
  - `getApps()` - List applications
  - `add()` - Create new app
  - `update()` - Update app
  - `stop()` - Stop app (v3 uses update with `stopped: true`)
  - `start()` - Start app (v3 uses update with `stopped: false`)
  - `restart()` - Restart app
  - `getApp()` - Get specific app
  - `remove()` - Delete app
  - `upload()` - Upload app bits
  - `getAppEnv()` - Get app environment
  - `setEnvironmentVariables()` - Set environment variables

### v3 API Differences
- State field changed: `state` (v2) → `lifecycle.type` and startup commands (v3)
- Memory/VCPUs: Handled differently
- Buildpacks: Relationship-based in v3
- Environment variables: Separate endpoint in v3

---

## Phase 4: Update Other Cloud Controller Models

### Objectives
- Update all Cloud Controller models to support v3

### Files to Modify (in order of importance)
1. `Organizations.js` - Core model
2. `Spaces.js` - Core model
3. `Services.js` - Services model
4. `ServiceInstances.js` - Service instances
5. `ServiceBindings.js` - Service bindings
6. `Routes.js` - Routes
7. `Domains.js` - Domains
8. `BuildPacks.js` - Buildpacks
9. `Stacks.js` - Stacks
10. `Users.js` - Users
11. `Events.js` - Events
12. `Jobs.js` - Jobs
13. `OrganizationsQuota.js` - Quotas
14. `SpacesQuota.js` - Quotas
15. `UserProvidedServices.js` - User-provided services

### Pattern to Follow
For each model:
1. Identify v2 endpoints used
2. Map to v3 equivalents
3. Update request/response handling
4. Add API version detection
5. Maintain backward compatibility

---

## Phase 5: Update Metrics & UAA Models

### Objectives
- Update remaining models (Logs, UsersUAA)

### Files to Modify
- `lib/model/metrics/Logs.js`
- `lib/model/uaa/UsersUAA.js`

### Details
- Logs endpoint may have different structure in v3
- UAA might have same endpoints but possibly different field names

---

## Phase 6: Write Tests

### Objectives
- Create comprehensive tests for v3 API
- Ensure v2 fallback works correctly
- Test API version switching

### Files to Create
- `test/lib/model/ApiVersionManagerTests.js`
- Update existing test files to support both v2 and v3

### Test Strategy
1. Mock both v2 and v3 API responses
2. Test each method with both API versions
3. Test API version configuration
4. Test error handling

---

## Phase 7: Documentation & Release

### Objectives
- Update README and docs for v3 usage
- Create migration guide for users
- Update API documentation

### Files to Create/Modify
- `README.md` - Add v3 usage examples
- `docs/API_v3_Migration_Guide.md` - Migration guide
- `docs/Configuration.md` - Configuration options
- `CHANGELOG.md` - Document changes

### Key Documentation
1. Usage examples for v3 (default)
2. How to use v2 (backward compatibility)
3. API version differences and migration notes
4. Configuration options

---

## API Version Mapping Reference

### v2 → v3 Endpoint Mappings

| Resource | v2 Endpoint | v3 Endpoint | Notes |
|----------|-------------|-------------|-------|
| Apps | `/v2/apps` | `/v3/apps` | Different state handling |
| Organizations | `/v2/organizations` | `/v3/organizations` | Similar structure |
| Spaces | `/v2/spaces` | `/v3/spaces` | Similar structure |
| Services | `/v2/services` | `/v3/service_offerings` | Renamed |
| Service Instances | `/v2/service_instances` | `/v3/service_instances` | Similar |
| Service Bindings | `/v2/service_bindings` | `/v3/service_credential_bindings` | Renamed |
| Routes | `/v2/routes` | `/v3/routes` | Similar structure |
| Domains | `/v2/domains` | `/v3/domains` | Similar |
| Users | `/v2/users` | `/v3/users` | Similar |
| Buildpacks | `/v2/buildpacks` | `/v3/buildpacks` | Similar |

---

## Implementation Order Priority

1. **Must Do First**:
   - Phase 1: Configuration system
   - Phase 2: Base class updates
   - Phase 3: Apps model (most used)

2. **Priority 2**:
   - Phase 4: Organizations, Spaces, Services (core models)

3. **Priority 3**:
   - Phase 4: Remaining models

4. **Final Steps**:
   - Phase 5: Metrics/UAA
   - Phase 6: Tests
   - Phase 7: Documentation & Release

---

## Backward Compatibility Strategy

1. Keep v2 as fallback for users who need it
2. Default to v3 but allow configuration to use v2
3. Provide clear error messages if v3 features aren't available in v2
4. Update all tests to verify both versions work

---

## Success Criteria

- [ ] All v3 endpoints are implemented
- [ ] v2 fallback configuration works
- [ ] Tests pass for both v2 and v3
- [ ] No breaking changes for existing users
- [ ] Documentation is complete and clear
- [ ] Code is maintainable and follows existing patterns
