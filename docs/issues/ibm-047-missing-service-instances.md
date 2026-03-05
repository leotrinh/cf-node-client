# Issue #47 — Missing Expected Instances (Same-Name Services in Different Spaces)

- **Source:** [IBM-Cloud/cf-nodejs-client#47](https://github.com/IBM-Cloud/cf-nodejs-client/issues/47)
- **Status:** NOT RESOLVED
- **Priority:** Medium
- **Created:** 2018-04-30

## Description
When two service instances share the same name in different spaces, `ServiceInstances` does not return the instance from the Dev space. Only the Prod space instance is found.

## Analysis
- `ServiceInstances._getInstancesV2()` passes filter as query string but no special handling for space-scoped filtering.
- `ServiceInstances._getInstancesV3()` similarly passes filter to `/v3/service_instances` without explicit space scoping.
- CF API requires `q=space_guid:xxx` (v2) or `space_guids=xxx` (v3) to disambiguate.

## Resolution Plan
- Add `getInstancesBySpace(spaceGuid, filter)` convenience method.
- Document that users must include space_guid in filter when names overlap.
- v2: `q=space_guid:xxx`
- v3: `space_guids=xxx` query param.
