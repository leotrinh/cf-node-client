# cf-node-client

**Author:** [leotrinh](https://github.com/leotrinh) & GitHub Copilot & Claude Kit
## Ship fast with Claude Kit
Ship Faster With AI Dev Teams
[Buy here to save 25% (always) ](https://claudekit.cc/?ref=VAK416FU)

![https://claudekit.cc/?ref=VAK416FU](https://cdn.tinhtd.info/public/go1/ads_ck.png)

**Status:** This package is a fork of [prosociallearnEU/cf-nodejs-client](https://github.com/prosociallearnEU/cf-nodejs-client) by Juan Antonio Breña Moral and is no longer actively maintained by the original authors. All new updates and maintenance are managed by [leotrinh](https://github.com/leotrinh).

---

#### Note: This package is not ready for a production App yet. This is a community-maintained fork.

This project provides a simple client library to interact with the [Cloud Foundry Architecture](https://docs.pivotal.io/pivotalcf/concepts/architecture/):

![ScreenShot](./docs/static/cf_architecture_block.png)

UML

![ScreenShot](./docs/static/umlDiagram.png)
## Documentation
- [Usage Guide](docs/Usage.md)
- [Service Usage](docs/Usage-cf-service.md)
- [System Architecture](docs/SystemArchitecture.md)
- [Code Review](docs/code-review/Code-Review-260304.md)

## API Reference

### v2 Endpoints
- [Apps v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Apps.html)
- [Buildpacks v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/BuildPacks.html)
- [Domains v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Domains.html)
- [Jobs v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Jobs.html)
- [Organizations v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Organizations.html)
- [Organizations Quotas v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/OrganizationsQuota.html)
- [Routes v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Routes.html)
- [Services v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Services.html)
- [Service Bindings v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/ServiceBindings.html)
- [Service Instances v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/ServiceInstances.html)
- [Service Plans v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/ServicePlans.html)
- [Spaces v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Spaces.html)
- [Spaces Quotas v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/SpacesQuota.html)
- [Stacks v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Stacks.html)
- [User Provided Services v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/UserProvidedServices.html)
- [Users v2](https://prosociallearneu.github.io/cf-nodejs-client/docs/v0.12.0/Users.html)

### v3 Endpoints
- [Apps v3](https://v3-apidocs.cloudfoundry.org/index.html#list-apps)
- [Spaces v3](https://v3-apidocs.cloudfoundry.org/#list-spaces)
- [Service Instances v3](https://v3-apidocs.cloudfoundry.org/#list-service-instances)
- [Service Bindings v3](https://v3-apidocs.cloudfoundry.org/#list-service-bindings)
- [Organizations v3](https://v3-apidocs.cloudfoundry.org/#list-organizations)
- [Users v3](https://v3-apidocs.cloudfoundry.org/#list-users)
- [Other v3 endpoints](https://v3-apidocs.cloudfoundry.org/)

---

## Getting Started

```bash
npm install cf-node-client --save
```

See [Usage Guide](docs/Usage.md) for examples and API usage.

## TypeScript Support

This package ships with built-in TypeScript type declarations. No additional `@types` package needed.

```typescript
import {
  CloudController,
  UsersUAA,
  Apps,
  Spaces,
  Organizations,
  OAuthToken
} from "cf-node-client";

const uaa = new UsersUAA("https://login.run.pivotal.io");
const token: OAuthToken = await uaa.login("user", "pass");

const apps = new Apps("https://api.run.pivotal.io");
apps.setToken(token);
const result = await apps.getApps();
console.log(result.resources);
```

### Available Types

| Type | Description |
|------|-------------|
| `OAuthToken` | UAA authentication token |
| `FilterOptions` | Pagination and query filters |
| `DeleteOptions` | Delete operation options |
| `ApiResponse<T>` | Typed API response wrapper |
| `CloudControllerBaseOptions` | Base constructor options |

See [examples/](examples/) for more TypeScript usage patterns.

## Technical Documentation
- [JSDoc](https://prosociallearneu.github.io/cf-nodejs-client/)

## Testing

This project has a test suite to ensure reliability.

Tested with:
| [Local Instance](https://github.com/yudai/cf_nise_installer) | [PWS](https://console.run.pivotal.io) | [Bluemix](https://console.ng.bluemix.net/) |
| -------------- |:-------------:| -------:|
| 2.25.0         | 2.47.0        | 2.40.0  |

**Last test:** 2016/01/26

**Test suite:**
```bash
npm test
```

**Code coverage:**
```bash
istanbul cover node_modules/mocha/bin/_mocha -- -R spec
```

**Continous integration:**
https://travis-ci.org/prosociallearnEU/cf-nodejs-client/

## Versions
See [CHANGELOG.md](CHANGELOG.md) for version history.

## References
- API Docs: http://apidocs.cloudfoundry.org/
- Developer list: https://lists.cloudfoundry.org/archives/list/cf-dev@lists.cloudfoundry.org/
- PWS Console: https://console.run.pivotal.io
- Bluemix Console: https://console.ng.bluemix.net/
- PWS Forum: https://support.run.pivotal.io/forums
- Bluemix Forum: https://developer.ibm.com/answers/

## Issues
If you have any question or doubt, please [create an issue](https://github.com/leotrinh/cf-node-client/issues).

## License
Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
