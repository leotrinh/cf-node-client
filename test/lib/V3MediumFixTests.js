/*jslint node: true*/
/*global describe: true, it: true */
"use strict";

const chai = require("chai");
const expect = chai.expect;

// Import the necessary modules
const UsersUAA = require("../../lib/model/uaa/UsersUAA");
const Logs = require("../../lib/model/metrics/Logs");

describe("v1.0.8 MEDIUM Priority Fixes - Unit Tests", function () {

    // ===== M3: API Key Authentication =====
    describe("M3 — UsersUAA.loginWithApiKey()", function () {
        let uaa;

        beforeEach(function () {
            uaa = new UsersUAA("https://uaa.example.com");
        });

        it("should return token object for valid API key", function (done) {
            const apiKey = "test-api-key-abc123xyz";
            
            uaa.loginWithApiKey(apiKey).then(function (result) {
                expect(result).to.be.an('object');
                expect(result.token_type).to.equal('bearer');
                expect(result.access_token).to.equal(apiKey);
                expect(result.expires_in).to.be.a('number');
                expect(result.expires_in).to.be.above(0);
                expect(result.scope).to.be.a('string');
                expect(result.jti).to.be.a('string');
                done();
            }).catch(done);
        });

        it("should trim whitespace from API key", function (done) {
            const apiKey = "  test-api-key-with-spaces  ";
            
            uaa.loginWithApiKey(apiKey).then(function (result) {
                expect(result.access_token).to.equal(apiKey.trim());
                done();
            }).catch(done);
        });

        it("should reject empty string API key", function (done) {
            uaa.loginWithApiKey("").then(function () {
                done(new Error("Should have rejected empty API key"));
            }).catch(function (error) {
                expect(error.message).to.include("API key is required");
                done();
            });
        });

        it("should reject whitespace-only API key", function (done) {
            uaa.loginWithApiKey("   ").then(function () {
                done(new Error("Should have rejected whitespace-only API key"));
            }).catch(function (error) {
                expect(error.message).to.include("API key is required");
                done();
            });
        });

        it("should reject null API key", function (done) {
            uaa.loginWithApiKey(null).then(function () {
                done(new Error("Should have rejected null API key"));
            }).catch(function (error) {
                expect(error.message).to.include("API key is required");
                done();
            });
        });

        it("should reject undefined API key", function (done) {
            uaa.loginWithApiKey(undefined).then(function () {
                done(new Error("Should have rejected undefined API key"));
            }).catch(function (error) {
                expect(error.message).to.include("API key is required");
                done();
            });
        });

        it("should reject numeric API key", function (done) {
            uaa.loginWithApiKey(12345).then(function () {
                done(new Error("Should have rejected numeric API key"));
            }).catch(function (error) {
                expect(error.message).to.include("API key is required");
                done();
            });
        });
    });

    // ===== M6: Enhanced Timestamp Parsing =====
    describe("M6 — Logs.parseLogs() RFC3339/ISO8601 Support", function () {

        it("should parse RFC3339 timestamp with Z timezone", function () {
            const rawLogs = "2024-01-15T14:30:00.123Z [APP/PROC/WEB/0] OUT Application started";
            const parsed = Logs.parseLogs(rawLogs);
            
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(1);
            expect(parsed[0].timestamp).to.be.instanceof(Date);
            expect(isNaN(parsed[0].timestamp.getTime())).to.be.false;
            expect(parsed[0].timestampRaw).to.equal("2024-01-15T14:30:00.123Z");
            expect(parsed[0].source).to.equal("APP");
            expect(parsed[0].sourceId).to.equal("PROC/WEB/0");
            expect(parsed[0].messageType).to.equal("OUT");
            expect(parsed[0].message).to.equal("Application started");
        });

        it("should parse ISO8601 timestamp without timezone", function () {
            const rawLogs = "2024-01-15T14:30:00 [APP/0] ERR Error occurred";
            const parsed = Logs.parseLogs(rawLogs);
            
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(1);
            expect(parsed[0].timestamp).to.be.instanceof(Date);
            expect(isNaN(parsed[0].timestamp.getTime())).to.be.false;
            expect(parsed[0].timestampRaw).to.equal("2024-01-15T14:30:00");
            expect(parsed[0].source).to.equal("APP");
            expect(parsed[0].sourceId).to.equal("0");
            expect(parsed[0].messageType).to.equal("ERR");
            expect(parsed[0].message).to.equal("Error occurred");
        });

        it("should parse RFC3339 with offset timezone", function () {
            const rawLogs = "2024-01-15T14:30:00+01:00 [RTR/1] OUT Request processed";
            const parsed = Logs.parseLogs(rawLogs);
            
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(1);
            expect(parsed[0].timestamp).to.be.instanceof(Date);
            expect(isNaN(parsed[0].timestamp.getTime())).to.be.false;
            expect(parsed[0].timestampRaw).to.equal("2024-01-15T14:30:00+01:00");
            expect(parsed[0].source).to.equal("RTR");
            expect(parsed[0].sourceId).to.equal("1");
        });

        it("should parse RFC3339 with milliseconds and timezone", function () {
            const rawLogs = "2024-03-05T10:45:30.999-05:00 [APP/0] OUT Message with ms";
            const parsed = Logs.parseLogs(rawLogs);
            
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(1);
            expect(parsed[0].timestamp).to.be.instanceof(Date);
            expect(isNaN(parsed[0].timestamp.getTime())).to.be.false;
            expect(parsed[0].timestampRaw).to.equal("2024-03-05T10:45:30.999-05:00");
        });

        it("should handle malformed timestamps gracefully", function () {
            const rawLogs = "invalid-timestamp [APP/0] OUT Message";
            const parsed = Logs.parseLogs(rawLogs);
            
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(1);
            expect(parsed[0].timestamp).to.be.null;
            expect(parsed[0].timestampRaw).to.equal("invalid-timestamp");
            expect(parsed[0].message).to.equal("Message");
        });

        it("should handle multiple log entries with mixed formats", function () {
            const rawLogs = 
                "2024-01-15T14:30:00.123Z [APP/0] OUT Line 1\n" +
                "2024-01-15T14:30:01.456Z [APP/0] ERR Line 2\n" +
                "2024-01-15T14:30:02+00:00 [RTR/1] OUT Line 3";
            const parsed = Logs.parseLogs(rawLogs);
            
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(3);
            parsed.forEach(function(entry) {
                expect(entry.timestamp).to.be.instanceof(Date);
                expect(isNaN(entry.timestamp.getTime())).to.be.false;
            });
        });

        it("should return empty array for null input", function () {
            const parsed = Logs.parseLogs(null);
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(0);
        });

        it("should return empty array for undefined input", function () {
            const parsed = Logs.parseLogs(undefined);
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(0);
        });

        it("should return empty array for empty string", function () {
            const parsed = Logs.parseLogs("");
            expect(parsed).to.be.an('array');
            expect(parsed.length).to.equal(0);
        });

        it("should filter out blank lines", function () {
            const rawLogs = "2024-01-15T14:30:00Z [APP/0] OUT Line 1\n\n\n2024-01-15T14:30:01Z [APP/0] OUT Line 2";
            const parsed = Logs.parseLogs(rawLogs);
            expect(parsed.length).to.equal(2);
        });
    });

    // ===== M1: HANA Cloud Instance Lifecycle (verify parameters) =====
    describe("M1 — ServiceInstances HANA Cloud start/stop parameters", function () {
        it("should have startInstance and stopInstance methods", function () {
            const ServiceInstances = require("../../lib/model/cloudcontroller/ServiceInstances");
            const si = new ServiceInstances("https://api.cf.example.com");
            
            expect(si.startInstance).to.be.a('function');
            expect(si.stopInstance).to.be.a('function');
        });
    });

    // ===== M2: URL Validation (verify function exists) =====
    describe("M2 — CloudControllerBase URL validation", function () {
        it("should validate endpoint URLs in setEndPoint", function () {
            const CloudControllerBase = require("../../lib/model/cloudcontroller/CloudControllerBase");
            const ccb = new CloudControllerBase("https://api.cf.example.com");
            
            // Should not throw for valid URLs
            expect(function() {
                ccb.setEndPoint("https://api.cf.example.com");
            }).to.not.throw();
            
            expect(function() {
                ccb.setEndPoint("http://localhost:8080");
            }).to.not.throw();
            
            // Should throw for invalid URLs
            expect(function() {
                ccb.setEndPoint("not-a-url");
            }).to.throw();
            
            expect(function() {
                ccb.setEndPoint("");
            }).to.throw();
        });
    });

    // ===== M4: Space-scoped queries (verify methods exist) =====
    describe("M4 — ServiceInstances space-scoped queries", function () {
        it("should have getInstancesBySpace and getInstanceByNameInSpace methods", function () {
            const ServiceInstances = require("../../lib/model/cloudcontroller/ServiceInstances");
            const si = new ServiceInstances("https://api.cf.example.com");
            
            expect(si.getInstancesBySpace).to.be.a('function');
            expect(si.getInstanceByNameInSpace).to.be.a('function');
        });
    });

    // ===== M5: Token introspection (verify method exists) =====
    describe("M5 — UsersUAA.getTokenInfo()", function () {
        it("should have getTokenInfo method", function () {
            const uaa = new UsersUAA("https://uaa.example.com");
            expect(uaa.getTokenInfo).to.be.a('function');
        });
    });
});
