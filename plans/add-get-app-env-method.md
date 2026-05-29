# Plan: Add `getAppEnv` to AppsDeployment — CF System Env Vars

## Root Cause

**`cf-node-client` chỉ có `getEnvironmentVariables(appGuid)`** → gọi `GET /v3/apps/:guid/environment_variables` (**user-provided vars**). System vars (VCAP_*, CF_*) không có trong endpoint này.

System vars nằm ở endpoint khác: `GET /v3/apps/:guid/env` → trả `{ system_env_json, application_env_json, running_env_json }`.

Khi gọi `/env-vars` trên frontend → backend dùng `getEnvironmentVariables` → trả `{}` → user thấy trắng.

## Architecture

```
GET /v3/apps/:guid/environment_variables  (existing)
  → User-provided vars only: { var: { USER_KEY: "val" } }

GET /v3/apps/:guid/env                   (MISSING)
  → System vars: { running_env_json, application_env_json, system_env_json }
      running_env_json:       LOG4J_FORMAT_MSG_NO_LOOKUPS, SPRING_APPLICATION_ASYNC, ...
      application_env_json:    VCAP_APPLICATION, ...
      system_env_json:        VCAP_SERVICES, ...
```

## Implementation

### 1. `lib/model/cloudcontroller/AppsDeployment.js`

Add 1 method:

```js
/**
 * Get app environment (system-injected vars) via GET /v3/apps/:guid/env
 * Returns running_env_json + application_env_json + system_env_json merged into flat key:value
 *
 * @param {String} appGuid
 * @returns {Promise<{running_env_json: Object, application_env_json: Object, system_env_json: Object}>}
 */
getAppEnv(appGuid) {
    const token = this.getAuthorizationHeader();
    const options = {
        method: "GET",
        url: `${this.API_URL}/v3/apps/${appGuid}/env`,
        headers: { Authorization: token }
    };
    return this.REST.request(options, this.HttpStatus.OK, true);
}
```

### 2. `types/index.d.ts`

Add TypeScript type for `getAppEnv`:

```ts
/** Result of getAppEnv */
export interface AppEnv {
  running_env_json: Record<string, any>;
  application_env_json: Record<string, any>;
  system_env_json: Record<string, any>;
}

/** Get system-injected environment vars (VCAP_*, CF_* etc.) via GET /v3/apps/:guid/env */
getAppEnv(appGuid: string): Promise<AppEnv>;
```

### 3. Unit Test

```js
// test/lib/model/AppsDeploymentTests.js
it('getAppEnv should call GET /v3/apps/:guid/env', async () => {
    const appsDeployment = new AppsDeployment('https://api.cf.example.com', { apiVersion: 'v3' });
    mockRequest.mockResolvedValueOnce({
        running_env_json: { LOG4J: 'true' },
        application_env_json: { VCAP_APPLICATION: {} },
        system_env_json: { VCAP_SERVICES: {} }
    });
    const result = await appsDeployment.getAppEnv('app-guid-123');
    expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
            url: 'https://api.cf.example.com/v3/apps/app-guid-123/env',
            method: 'GET'
        }),
        200, true
    );
    expect(result.system_env_json).toBeDefined();
});
```

## Files to Modify

| File | Change |
|------|--------|
| `lib/model/cloudcontroller/AppsDeployment.js` | Add `getAppEnv()` method |
| `types/index.d.ts` | Add `AppEnv` interface + `getAppEnv()` declaration |
| `test/lib/model/AppsDeploymentTests.js` | Add unit test |

## Backward Compatibility

- `getEnvironmentVariables()` giữ nguyên → user-provided vars
- `getAppEnv()` method mới → system vars
- Patch version bump: `1.0.8` → `1.0.9`

## Success Criteria

- `getAppEnv('guid')` → returns `{ running_env_json, application_env_json, system_env_json }`
- VCAP_SERVICES, VCAP_APPLICATION có trong response khi test with real CF
- TypeScript compile passes
- All existing tests still pass
