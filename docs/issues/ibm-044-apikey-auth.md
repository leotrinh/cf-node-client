# Issue #44 — Use APIKey Instead of User/Password Credentials

- **Source:** [IBM-Cloud/cf-nodejs-client#44](https://github.com/IBM-Cloud/cf-nodejs-client/issues/44)
- **Status:** NOT RESOLVED
- **Priority:** Medium
- **Created:** 2017-08-24

## Description
Request to support Bluemix/IBM Cloud APIKey authentication instead of username/password.

## Analysis
- `UsersUAA.login()` only supports `grant_type: "password"`.
- No `loginWithApiKey()`, `loginWithClientCredentials()`, or API key grant type support.
- IBM grant type: `urn:ibm:params:oauth:grant-type:apikey`.
- CF generic: `grant_type: "client_credentials"` for service accounts.

## Resolution Plan
- Add `loginWithApiKey(apiKey)` method using IBM-specific grant type.
- Add `loginWithClientCredentials(clientId, clientSecret)` for generic CF OAuth.
- Both should return standard `OAuthToken` object.
