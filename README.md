# cf-node-client

**Author:** [leotrinh](https://github.com/leotrinh) & GitHub Copilot

**Status:** This package is a fork of [prosociallearnEU/cf-nodejs-client](https://github.com/prosociallearnEU/cf-nodejs-client) and is no longer actively maintained by the original authors. All new updates and maintenance are managed by [leotrinh](https://github.com/leotrinh).

---

#### Note: This package is not ready for a production App yet. This is a community-maintained fork.

This project provides a simple client library to interact with the [Cloud Foundry Architecture](https://docs.pivotal.io/pivotalcf/concepts/architecture/):

![ScreenShot](https://raw.githubusercontent.com/prosociallearnEU/cf-node-client/master/docs/cf_architecture_block.png)

## Documentation
- [Usage Guide](docs/plan/usage/START_HERE.md)
- [Documentation Index](docs/plan/usage/README_DOCUMENTATION_INDEX.md)
- [Implementation Plan](docs/plan/phases/IMPLEMENTATION_PLAN_FINAL.md)
- [Migration Guide](docs/plan/migration/MIGRATION_GUIDE.md)
- [Code Review](docs/plan/code-review/Code-Review-260304.md)

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

See [Usage Guide](docs/plan/usage/START_HERE.md) for examples and API usage.

## Technical Documentation
- [JSDoc](https://prosociallearneu.github.io/cf-nodejs-client/)

## Testing

This project has a test suite to ensure reliability. See [Test Cases](docs/plan/usage/START_HERE.md) for Mocha & Chai usage and coverage details.

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
- CF for Beginners: From Zero to Hero http://slides.cf-hero.cloudcredo.io/

## Issues
If you have any question or doubt, please [create an issue](https://github.com/leotrinh/cf-node-client/issues).

## License
Licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
