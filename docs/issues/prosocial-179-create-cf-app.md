# Issue #179 — How to Create a CF App Through This Client

- **Source:** [prosociallearnEU/cf-nodejs-client#179](https://github.com/prosociallearnEU/cf-nodejs-client/issues/179)
- **Status:** ✅ RESOLVED IN FORK (Documentation)
- **Priority:** N/A
- **Created:** 2016-04-24

## Description
User asks how to create a CF app using this client.

## Resolution
`Apps.add()` method exists with support for both v2 and v3 formats:

```javascript
// v3 (default)
await apps.add({ name: "my-app", relationships: { space: { data: { guid: spaceGuid } } } });

// v2
const apps = new Apps(endpoint, { apiVersion: "v2" });
await apps.add({ name: "my-app", space_guid: spaceGuid });
```

Full workflow: Create → Upload → Start is documented in examples and Usage guide.
