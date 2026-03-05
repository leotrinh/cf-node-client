# Issue #190 — Using This in General (Any CF Env)

- **Source:** [prosociallearnEU/cf-nodejs-client#190](https://github.com/prosociallearnEU/cf-nodejs-client/issues/190)
- **Status:** ✅ RESOLVED IN FORK (Documentation)
- **Priority:** N/A
- **Created:** 2016-12-27

## Description
User asks: (1) Does it work with any CF environment? (2) How are spaces handled?

## Resolution
- The library is **vendor-agnostic** — accepts any CF API endpoint URL in constructor.
- Works with: SAP BTP, Tanzu/Pivotal, IBM Cloud, SUSE CAP, open-source CF, or any CF-compatible API.
- Space handling uses standard CF API guid-based filtering (pass `space_guid` in filters).
- README now includes "Supported Cloud Foundry Platforms" table with all supported platforms.

## Verification
```javascript
// SAP BTP
const apps = new Apps("https://api.cf.eu10.hana.ondemand.com");
// Pivotal/Tanzu
const apps2 = new Apps("https://api.run.pivotal.io");
// Any CF
const apps3 = new Apps("https://api.cf.mycompany.com");
```

## Related
- IBM-Cloud#43 (duplicate issue).
