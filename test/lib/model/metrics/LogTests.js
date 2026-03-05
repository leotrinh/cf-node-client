/*jslint node: true*/
/*global describe: true, before: true, it: true */
"use strict";

var Promise = require('bluebird');
var chai = require("chai"),
    expect = require("chai").expect;

var argv = require('optimist').demand('config').argv;
var environment = argv.config;
var nconf = require('nconf');
nconf.argv().env().file({ file: 'config.json' });

var cf_api_url = nconf.get(environment + "_" + 'CF_API_URL'),
    username = nconf.get(environment + "_" + 'username'),
    password = nconf.get(environment + "_" + 'password');

var CloudController = require("../../../../lib/model/cloudcontroller/CloudController");
var CloudFoundryUsersUAA = require("../../../../lib/model/uaa/UsersUAA");
var CloudFoundryApps = require("../../../../lib/model/cloudcontroller/Apps");
var CloudFoundryLogs = require("../../../../lib/model/metrics/Logs");
CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();
CloudFoundryApps = new CloudFoundryApps();
CloudFoundryLogs = new CloudFoundryLogs();

describe("Cloud foundry Logs", function () {

    var authorization_endpoint = null;
    var token_endpoint = null;
    var logging_endpoint = null;
    var token_type = null;
    var access_token = null;

    before(function () {
        this.timeout(20000);

        CloudController.setEndPoint(cf_api_url);
        CloudFoundryApps.setEndPoint(cf_api_url);

        return CloudController.getInfo().then(function (result) {
            authorization_endpoint = result.authorization_endpoint;
            token_endpoint = result.token_endpoint;
            logging_endpoint = result.logging_endpoint;
            CloudFoundryUsersUAA.setEndPoint(authorization_endpoint);
            return CloudFoundryUsersUAA.login(username, password);
        }).then(function (result) {
            CloudFoundryUsersUAA.setToken(result);
            CloudFoundryApps.setToken(result);
            CloudFoundryLogs.setToken(result);
        });
    });

    it("The platform returns Logs", function () {
        this.timeout(6000);

        var app_guid = null;
        var ERROR_MESSAGE_NO_APPS = "No App";

        return CloudFoundryApps.getApps().then(function (result) {

            if (result.total_results === 0) {
                return new Promise(function check(resolve, reject) {
                    reject(ERROR_MESSAGE_NO_APPS);
                });
            }
            
            app_guid = result.resources[0].metadata.guid;
            //Process URL
            //console.log(logging_endpoint);
            logging_endpoint = logging_endpoint.replace("wss", "https");
            logging_endpoint = logging_endpoint.replace(":4443", "");
            logging_endpoint = logging_endpoint.replace(":443", "");//Bluemix support
            //console.log(logging_endpoint);
            CloudFoundryLogs.setEndPoint(logging_endpoint);
            return CloudFoundryLogs.getRecent(app_guid);
        }).then(function () {
            //console.log(result);
            expect(true).is.equal(true);
        }).catch(function (reason) {
            console.log(reason);
            expect(reason).to.equal(ERROR_MESSAGE_NO_APPS);
        });
    });

    // M6: Enhanced timestamp parsing tests
    it("parseLogs should handle RFC3339 timestamps with timezone", function () {
        var rawLogs = "2024-01-15T14:30:00.123Z [APP/PROC/WEB/0] OUT Application started";
        var parsed = CloudFoundryLogs.parseLogs(rawLogs);
        
        expect(parsed).to.be.an('array');
        expect(parsed.length).to.equal(1);
        expect(parsed[0].timestamp).to.be.instanceof(Date);
        expect(parsed[0].timestamp.getTime()).to.not.be.NaN;
        expect(parsed[0].timestampRaw).to.equal("2024-01-15T14:30:00.123Z");
        expect(parsed[0].source).to.equal("APP");
        expect(parsed[0].sourceId).to.equal("PROC/WEB/0");
        expect(parsed[0].messageType).to.equal("OUT");
        expect(parsed[0].message).to.equal("Application started");
    });

    it("parseLogs should handle ISO8601 timestamps without timezone", function () {
        var rawLogs = "2024-01-15T14:30:00 [APP/0] ERR Error occurred";
        var parsed = CloudFoundryLogs.parseLogs(rawLogs);
        
        expect(parsed).to.be.an('array');
        expect(parsed.length).to.equal(1);
        expect(parsed[0].timestamp).to.be.instanceof(Date);
        expect(parsed[0].timestamp.getTime()).to.not.be.NaN;
        expect(parsed[0].timestampRaw).to.equal("2024-01-15T14:30:00");
        expect(parsed[0].messageType).to.equal("ERR");
    });

    it("parseLogs should handle RFC3339 with offset timezone", function () {
        var rawLogs = "2024-01-15T14:30:00+01:00 [RTR/1] OUT Request processed";
        var parsed = CloudFoundryLogs.parseLogs(rawLogs);
        
        expect(parsed).to.be.an('array');
        expect(parsed.length).to.equal(1);
        expect(parsed[0].timestamp).to.be.instanceof(Date);
        expect(parsed[0].timestamp.getTime()).to.not.be.NaN;
        expect(parsed[0].timestampRaw).to.equal("2024-01-15T14:30:00+01:00");
    });

    it("parseLogs should handle malformed timestamps gracefully", function () {
        var rawLogs = "invalid-timestamp [APP/0] OUT Message";
        var parsed = CloudFoundryLogs.parseLogs(rawLogs);
        
        expect(parsed).to.be.an('array');
        expect(parsed.length).to.equal(1);
        expect(parsed[0].timestamp).to.be.null;
        expect(parsed[0].timestampRaw).to.equal("invalid-timestamp");
        expect(parsed[0].message).to.equal("Message");
    });

    it("parseLogs should handle multiple log entries", function () {
        var rawLogs = 
            "2024-01-15T14:30:00.123Z [APP/0] OUT Line 1\n" +
            "2024-01-15T14:30:01.456Z [APP/0] ERR Line 2\n" +
            "2024-01-15T14:30:02+00:00 [RTR/1] OUT Line 3";
        var parsed = CloudFoundryLogs.parseLogs(rawLogs);
        
        expect(parsed).to.be.an('array');
        expect(parsed.length).to.equal(3);
        parsed.forEach(function(entry) {
            expect(entry.timestamp).to.be.instanceof(Date);
            expect(entry.timestamp.getTime()).to.not.be.NaN;
        });
    });

});