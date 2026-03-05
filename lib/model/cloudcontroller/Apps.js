"use strict";

const AppsCore = require("./AppsCore");
const AppsDeployment = require("./AppsDeployment");
const AppsCopy = require("./AppsCopy");

/**
 * Apps — unified facade combining core CRUD, deployment, and copy operations.
 * Extends AppsCore directly; mixes in methods from AppsDeployment and AppsCopy.
 *
 * Backward-compatible: `new Apps(endPoint, options)` works exactly as before.
 *
 * @class
 */
class Apps extends AppsCore {}

// Mixin helper — copy prototype methods (skip constructor)
function mixin(Target, Source) {
    Object.getOwnPropertyNames(Source.prototype).forEach(name => {
        if (name !== "constructor") {
            Target.prototype[name] = Source.prototype[name];
        }
    });
}

mixin(Apps, AppsDeployment);
mixin(Apps, AppsCopy);

module.exports = Apps;
