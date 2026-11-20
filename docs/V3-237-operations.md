# Cloud Controller v3.237.0 operation client

`V3Api` exposes the 247 operation headings found under **Definition** in the [versioned reference](https://v3-apidocs.cloudfoundry.org/version/3.237.0/). Two pairs share the same HTTP method/path but represent distinct request bodies (copy vs create droplet/package). The operation ID is the documentation heading anchor. Existing resource-specific clients remain available and unchanged.

```js
const { V3Api } = require('cf-node-client');
const api = new V3Api('https://api.example.org');
api.setToken({ token_type: 'Bearer', access_token: process.env.CF_TOKEN });
const deployments = await api.invoke('list-deployments', {
  query: { per_page: 50, page: 1 }
});
const deployment = await api.invoke('create-a-deployment', {
  body: { relationships: { app: { data: { guid: appGuid } } } }
});
```

Arguments: `params` supplies `:guid` and other placeholders (URL-encoded), `query` supplies query parameters including repeated array values, and `body` accepts JSON, string/Buffer or a `form-data` instance for upload. The operation's documented example status is checked; operations with multiple documented outcomes accept all listed statuses. `expectedStatus` overrides this for a server-specific variant. Download redirect operations return `{ status: 302, location }` instead of forwarding the OAuth token to a redirected host. Use `responseMetadata: true` for asynchronous operations to receive `{ status, location, body }` and poll the job URL; otherwise the result is the response body. For responses that are 204, the value is `null` if parsed as JSON; otherwise empty responses are returned as text.

This is a **low-level operation transport**, not generated typed request/response models or validated schemas. The checked-in `plans/v3-237-inventory/operations.json` records documented required parameters for review; callers supply body shapes according to the linked reference. Tests cover route/method/status dispatch for every operation using stubbed requests, but do not prove behavior against a live Cloud Foundry deployment.
