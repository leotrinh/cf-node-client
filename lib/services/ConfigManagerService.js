"use strict";

const ApiConfig = require("../config/ApiConfig");
const ApiVersionManager = require("../config/ApiVersionManager");

module.exports = {
    getApiConfig: function(apiVersion) {
        return new ApiConfig({ apiVersion: apiVersion });
    },
    getApiVersionManager: function(version) {
        return new ApiVersionManager(version);
    }
};
