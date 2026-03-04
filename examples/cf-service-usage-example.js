/* eslint-disable no-console, valid-jsdoc, jsdoc/require-description, jsdoc/require-param-description, jsdoc/require-returns-description */
"use strict";

//  Example: Using cf-node-client to interact with Cloud Foundry

const CloudController = require("cf-node-client").CloudController;
const UsersUAA = require("cf-node-client").UsersUAA;
const Organizations = require("cf-node-client").Organizations;
const Spaces = require("cf-node-client").Spaces;
const Apps = require("cf-node-client").Apps;

const apiCF = "https://api.cf.example.com";
const credentials = {username: "user", password: "pass"};

/**
 * Get authentication token from Cloud Foundry
 * @param {string} token
 * @returns {Promise}
 */
function getAuthToken() {
    const cfController = new CloudController(apiCF);
    const usersUAA = new UsersUAA();

    return cfController.getInfo().then(function(info) {
        usersUAA.setEndPoint(info.authorization_endpoint);
        return usersUAA.login(credentials.username, credentials.password);
    });
}

/**
 * Get organization by name
 * @param {string} token
 * @param {string} orgName
 * @returns {Promise}
 */
function getOrganization(token, orgName) {
    const orgsClient = new Organizations(apiCF);

    orgsClient.setToken(token);

    return orgsClient.getOrganizations({page: 1, "results-per-page": 500})
        .then(function(result) {
            return result.resources.find(function(org) {
                return org.entity.name === orgName;
            });
        });
}

/**
 * Get space by name in organization
 * @param {string} token
 * @param {Object} org
 * @param {string} spaceName
 * @returns {Promise}
 */
function getSpace(token, org, spaceName) {
    const spacesClient = new Spaces(apiCF);

    spacesClient.setToken(token);

    return spacesClient.getSpaces({page: 1, "results-per-page": 500})
        .then(function(result) {
            return result.resources.find(function(space) {
                return space.entity.organization_guid === org.metadata.guid &&
                       space.entity.name === spaceName;
            });
        });
}

/**
 * Get apps in space
 * @param {string} token
 * @param {string} spaceGuid
 * @returns {Promise}
 */
function getAppsInSpace(token, spaceGuid) {
    const spacesClient = new Spaces(apiCF);

    spacesClient.setToken(token);

    return spacesClient.getSpaceApps(spaceGuid, {page: 1, "results-per-page": 100});
}

/**
 * Start application
 * @param {string} token
 * @param {string} appGuid
 * @returns {Promise}
 */
function startApp(token, appGuid) {
    const appsClient = new Apps(apiCF);

    appsClient.setToken(token);

    return appsClient.start(appGuid);
}

//  Main execution chain
getAuthToken()
    .then(function(token) {
        return getOrganization(token, "my-org")
            .then(function(org) {
                return getSpace(token, org, "my-space")
                    .then(function(space) {
                        return {token: token, space: space};
                    });
            });
    })
    .then(function(data) {
        return getAppsInSpace(data.token, data.space.metadata.guid)
            .then(function(apps) {
                console.log("Apps in space:", apps.resources.map(function(app) {
                    return app.entity.name;
                }));

                if (apps.resources.length > 0) {
                    return startApp(data.token, apps.resources[0].metadata.guid)
                        .then(function() {
                            console.log("App started:", apps.resources[0].entity.name);
                        });
                }
            });
    })
    .catch(function(err) {
        console.error("CF Error:", err.message);
    });
