"use strict";

/** Library Version */
module.exports.version = "1.0.5";

// ── Cloud Controller models ────────────────────────────────────────────
const Apps              = require("./lib/model/cloudcontroller/Apps");
const BuildPacks        = require("./lib/model/cloudcontroller/BuildPacks");
const CloudController   = require("./lib/model/cloudcontroller/CloudController");
const Domains           = require("./lib/model/cloudcontroller/Domains");
const Events            = require("./lib/model/cloudcontroller/Events");
const Jobs              = require("./lib/model/cloudcontroller/Jobs");
const Organizations     = require("./lib/model/cloudcontroller/Organizations");
const OrganizationsQuota = require("./lib/model/cloudcontroller/OrganizationsQuota");
const Routes            = require("./lib/model/cloudcontroller/Routes");
const Services          = require("./lib/model/cloudcontroller/Services");
const ServiceBindings   = require("./lib/model/cloudcontroller/ServiceBindings");
const ServiceInstances  = require("./lib/model/cloudcontroller/ServiceInstances");
const ServicePlans      = require("./lib/model/cloudcontroller/ServicePlans");
const Spaces            = require("./lib/model/cloudcontroller/Spaces");
const SpacesQuota       = require("./lib/model/cloudcontroller/SpacesQuota");
const Stacks            = require("./lib/model/cloudcontroller/Stacks");
const UserProvidedServices = require("./lib/model/cloudcontroller/UserProvidedServices");
const Users             = require("./lib/model/cloudcontroller/Users");

// ── Metrics & UAA ──────────────────────────────────────────────────────
const Logs              = require("./lib/model/metrics/Logs");
const UsersUAA          = require("./lib/model/uaa/UsersUAA");

// ── Apps sub-modules (advanced usage) ──────────────────────────────────
const AppsCore          = require("./lib/model/cloudcontroller/AppsCore");
const AppsDeployment    = require("./lib/model/cloudcontroller/AppsDeployment");
const AppsCopy          = require("./lib/model/cloudcontroller/AppsCopy");

// ── Public exports ─────────────────────────────────────────────────────
module.exports.Apps              = Apps;
module.exports.AppsCore          = AppsCore;
module.exports.AppsCopy          = AppsCopy;
module.exports.AppsDeployment    = AppsDeployment;
module.exports.BuildPacks        = BuildPacks;
module.exports.CloudController   = CloudController;
module.exports.Domains           = Domains;
module.exports.Events            = Events;
module.exports.Jobs              = Jobs;
module.exports.Logs              = Logs;
module.exports.Organizations     = Organizations;
module.exports.OrganizationsQuota = OrganizationsQuota;
module.exports.Routes            = Routes;
module.exports.Services          = Services;
module.exports.ServiceBindings   = ServiceBindings;
module.exports.ServiceInstances  = ServiceInstances;
module.exports.ServicePlans      = ServicePlans;
module.exports.Spaces            = Spaces;
module.exports.SpacesQuota       = SpacesQuota;
module.exports.Stacks            = Stacks;
module.exports.UserProvidedServices = UserProvidedServices;
module.exports.Users             = Users;
module.exports.UsersUAA          = UsersUAA;
