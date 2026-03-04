'use strict';

var exports = module.exports = {};

/**
 * Library Version
 * @type {String}
 */
exports.version = '1.0.0';

/**
 * Support for Apps
 * @type {typeof Apps}
 */
var Apps = require('./lib/model/cloudcontroller/Apps');
exports.Apps = Apps;

/**
 * Support for Buildpacks
 * @type {typeof BuildPacks}
 */
var BuildPacks = require('./lib/model/cloudcontroller/BuildPacks');
exports.BuildPacks = BuildPacks;

/**
 * Support for Cloud Controller
 * @type {typeof CloudController}
 */
var CloudController = require('./lib/model/cloudcontroller/CloudController');
exports.CloudController = CloudController;


/**
 * Support for Domains
 * @type {typeof Domains}
 */
var Domains = require('./lib/model/cloudcontroller/Domains');
exports.Domains = Domains;

/**
 * Support for Events
 * @type {typeof Events}
 */
var Events = require('./lib/model/cloudcontroller/Events');
exports.Events = Events;

/**
 * Support for Jobs
 * @type {typeof Jobs}
 */
var Jobs = require('./lib/model/cloudcontroller/Jobs');
exports.Jobs = Jobs;

/**
 * Support for Logs
 * @type {typeof Logs}
 */
var Logs = require('./lib/model/metrics/Logs');
exports.Logs = Logs;

/**
 * Support for Organizations
 * @type {typeof Organizations}
 */
var Organizations = require('./lib/model/cloudcontroller/Organizations');
exports.Organizations = Organizations;

/**
 * Support for Organizations Quota
 * @type {typeof OrganizationsQuota}
 */
var OrganizationsQuota = require('./lib/model/cloudcontroller/OrganizationsQuota');
exports.OrganizationsQuota = OrganizationsQuota;

/**
 * Support for Routes
 * @type {typeof Routes}
 */
var Routes = require('./lib/model/cloudcontroller/Routes');
exports.Routes = Routes;

/**
 * Support for Services
 * @type {typeof Services}
 */
var Services = require('./lib/model/cloudcontroller/Services');
exports.Services = Services;

/**
 * Support for ServiceBindings
 * @type {typeof ServiceBindings}
 */
var ServiceBindings = require('./lib/model/cloudcontroller/ServiceBindings');
exports.ServiceBindings = ServiceBindings;

/**
 * Support for ServiceInstances
 * @type {typeof ServiceInstances}
 */
var ServiceInstances = require('./lib/model/cloudcontroller/ServiceInstances');
exports.ServiceInstances = ServiceInstances;

/**
 * Support for ServicePlans
 * @type {typeof ServicePlans}
 */
var ServicePlans = require('./lib/model/cloudcontroller/ServicePlans');
exports.ServicePlans = ServicePlans;

/**
 * Support for Spaces
 * @type {typeof Spaces}
 */
var Spaces = require('./lib/model/cloudcontroller/Spaces');
exports.Spaces = Spaces;

/**
 * Support for Spaces Quota
 * @type {typeof SpacesQuota}
 */
var SpacesQuota = require('./lib/model/cloudcontroller/SpacesQuota');
exports.SpacesQuota = SpacesQuota;

/**
 * Support for Stacks
 * @type {typeof Stacks}
 */
var Stacks = require('./lib/model/cloudcontroller/Stacks');
exports.Stacks = Stacks;

/**
 * Support for User Provided Services
 * @type {typeof UserProvidedServices}
 */
var UserProvidedServices = require('./lib/model/cloudcontroller/UserProvidedServices');
exports.UserProvidedServices = UserProvidedServices;

/**
 * Support for Users
 * @type {typeof Users}
 */
var Users = require('./lib/model/cloudcontroller/Users');
exports.Users = Users;

/**
 * Support for Users UAA
 * @type {typeof UsersUAA}
 */
var UsersUAA = require('./lib/model/uaa/UsersUAA');
exports.UsersUAA = UsersUAA;
