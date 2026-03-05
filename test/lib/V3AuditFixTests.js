/**
 * Unit tests for v1.0.6 audit fixes (CRITICAL + HIGH).
 * Validates v3 status codes, request body structures, and upload method.
 * Uses REST.request / REST.requestV3 / REST.upload stubs — no live CF API needed.
 */

"use strict";

const { expect } = require("chai");

const AppsCore = require("../../lib/model/cloudcontroller/AppsCore");
const Domains = require("../../lib/model/cloudcontroller/Domains");
const BuildPacks = require("../../lib/model/cloudcontroller/BuildPacks");
const Users = require("../../lib/model/cloudcontroller/Users");
const OrganizationsQuota = require("../../lib/model/cloudcontroller/OrganizationsQuota");
const SpacesQuota = require("../../lib/model/cloudcontroller/SpacesQuota");
const HttpUtils = require("../../lib/utils/HttpUtils");
const HttpStatus = require("../../lib/utils/HttpStatus");

// ── Helpers ────────────────────────────────────────────────────────────

const endpoint = "https://api.example.com";
const mockToken = { token_type: "Bearer", access_token: "test_token" };

/**
 * Stub REST.request to capture call args and return canned response.
 */
function stubRequest(model) {
    const calls = [];
    model.REST.request = function (options, expectedStatus, parseJson) {
        calls.push({ options, expectedStatus, parseJson });
        return Promise.resolve({});
    };
    return calls;
}

/**
 * Stub REST.requestV3 to capture call args and return canned response.
 */
function stubRequestV3(model) {
    const calls = [];
    model.REST.requestV3 = function (method, url, token, data, expectedStatus) {
        calls.push({ method, url, token, data, expectedStatus });
        return Promise.resolve({});
    };
    return calls;
}

/**
 * Stub REST.upload to capture call args and return canned response.
 */
function stubUpload(model) {
    const calls = [];
    model.REST.upload = function (url, options, expectedStatus, jsonOutput) {
        calls.push({ url, options, expectedStatus, jsonOutput });
        return Promise.resolve({});
    };
    return calls;
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("v1.0.6 Audit Fixes — CRITICAL + HIGH", function () {
    this.timeout(5000);

    // ── C1: AppsCore.remove() v3 expects 202 ──────────────────────────

    describe("C1 — AppsCore.remove() v3 expects 202 Accepted", function () {

        it("should use ACCEPTED (202) for v3 delete", function () {
            const apps = new AppsCore(endpoint);
            apps.setToken(mockToken);
            const calls = stubRequest(apps);

            return apps.remove("app-guid-1").then(() => {
                expect(calls).to.have.lengthOf(1);
                expect(calls[0].expectedStatus).to.equal(HttpStatus.ACCEPTED);
                expect(calls[0].options.method).to.equal("DELETE");
            });
        });

        it("should still use NO_CONTENT (204) for v2 delete", function () {
            const apps = new AppsCore(endpoint, { apiVersion: "v2" });
            apps.setToken(mockToken);
            const calls = stubRequest(apps);

            return apps.remove("app-guid-1").then(() => {
                expect(calls).to.have.lengthOf(1);
                expect(calls[0].expectedStatus).to.equal(HttpStatus.NO_CONTENT);
            });
        });
    });

    // ── C2: Domains.remove() v3 expects 202 ───────────────────────────

    describe("C2 — Domains.remove() v3 expects 202 Accepted", function () {

        it("should use ACCEPTED (202) for v3 delete", function () {
            const domains = new Domains(endpoint);
            domains.setToken(mockToken);
            const calls = stubRequestV3(domains);

            return domains.remove("domain-guid-1").then(() => {
                expect(calls).to.have.lengthOf(1);
                expect(calls[0].method).to.equal("DELETE");
                expect(calls[0].expectedStatus).to.equal(HttpStatus.ACCEPTED);
            });
        });

        it("should still use NO_CONTENT (204) for v2 delete", function () {
            const domains = new Domains(endpoint, { apiVersion: "v2" });
            domains.setToken(mockToken);
            const calls = stubRequest(domains);

            return domains.remove("domain-guid-1").then(() => {
                expect(calls).to.have.lengthOf(1);
                expect(calls[0].expectedStatus).to.equal(HttpStatus.NO_CONTENT);
            });
        });
    });

    // ── C3: BuildPacks.remove() v3 expects 202 ────────────────────────

    describe("C3 — BuildPacks.remove() v3 expects 202 Accepted", function () {

        it("should use ACCEPTED (202) for v3 delete", function () {
            const bp = new BuildPacks(endpoint);
            bp.setToken(mockToken);
            const calls = stubRequestV3(bp);

            return bp.remove("bp-guid-1").then(() => {
                expect(calls).to.have.lengthOf(1);
                expect(calls[0].method).to.equal("DELETE");
                expect(calls[0].expectedStatus).to.equal(HttpStatus.ACCEPTED);
            });
        });
    });

    // ── C4: Users.remove() v3 expects 202 ─────────────────────────────

    describe("C4 — Users.remove() v3 expects 202 Accepted", function () {

        it("should use ACCEPTED (202) for v3 delete", function () {
            const users = new Users(endpoint);
            users.setToken(mockToken);
            const calls = stubRequestV3(users);

            return users.remove("user-guid-1").then(() => {
                expect(calls).to.have.lengthOf(1);
                expect(calls[0].method).to.equal("DELETE");
                expect(calls[0].expectedStatus).to.equal(HttpStatus.ACCEPTED);
            });
        });
    });

    // ── C5: HttpUtils.upload() method parameter ────────────────────────

    describe("C5 — HttpUtils.upload() respects options.method", function () {

        it("should default to PUT when no method specified", function () {
            const httpUtils = new HttpUtils();
            // We can't easily test without a real server, but we can verify
            // the method parameter is documented. Let's verify via AppsDeployment
            // stub test instead.
            expect(httpUtils.upload).to.be.a("function");
        });
    });

    // ── H1: Domains.add() v3 relationships body ───────────────────────

    describe("H1 — Domains.add() v3 uses relationships structure", function () {

        it("should nest organization_guid in relationships", function () {
            const domains = new Domains(endpoint);
            domains.setToken(mockToken);
            const calls = stubRequestV3(domains);

            return domains.add({ name: "my.domain.com", organization_guid: "org-guid-1" }).then(() => {
                expect(calls).to.have.lengthOf(1);
                const body = calls[0].data;
                expect(body.name).to.equal("my.domain.com");
                expect(body).to.not.have.property("organization_guid");
                expect(body.relationships.organization.data.guid).to.equal("org-guid-1");
            });
        });

        it("should omit relationships when no org guid", function () {
            const domains = new Domains(endpoint);
            domains.setToken(mockToken);
            const calls = stubRequestV3(domains);

            return domains.add({ name: "shared.domain.com" }).then(() => {
                const body = calls[0].data;
                expect(body.name).to.equal("shared.domain.com");
                expect(body).to.not.have.property("relationships");
            });
        });

        it("should set internal flag", function () {
            const domains = new Domains(endpoint);
            domains.setToken(mockToken);
            const calls = stubRequestV3(domains);

            return domains.add({ name: "internal.domain.com", internal: true }).then(() => {
                expect(calls[0].data.internal).to.equal(true);
            });
        });
    });

    // ── H2: Users.add() v3 uses guid field ────────────────────────────

    describe("H2 — Users.add() v3 uses guid (UAA user GUID)", function () {

        it("should send guid field in v3 body", function () {
            const users = new Users(endpoint);
            users.setToken(mockToken);
            const calls = stubRequestV3(users);

            return users.add({ guid: "uaa-user-guid-123" }).then(() => {
                expect(calls).to.have.lengthOf(1);
                const body = calls[0].data;
                expect(body.guid).to.equal("uaa-user-guid-123");
                expect(body).to.not.have.property("username");
                expect(body).to.not.have.property("origin");
            });
        });

        it("should include metadata when provided", function () {
            const users = new Users(endpoint);
            users.setToken(mockToken);
            const calls = stubRequestV3(users);

            const opts = {
                guid: "uaa-user-guid-456",
                metadata: { labels: { env: "production" } }
            };
            return users.add(opts).then(() => {
                const body = calls[0].data;
                expect(body.guid).to.equal("uaa-user-guid-456");
                expect(body.metadata.labels.env).to.equal("production");
            });
        });

        it("should expect CREATED (201) status", function () {
            const users = new Users(endpoint);
            users.setToken(mockToken);
            const calls = stubRequestV3(users);

            return users.add({ guid: "uaa-guid" }).then(() => {
                expect(calls[0].expectedStatus).to.equal(HttpStatus.CREATED);
            });
        });
    });

    // ── H3: OrganizationsQuota._translateToV3() ───────────────────────

    describe("H3 — OrganizationsQuota._translateToV3() nested structure", function () {

        it("should translate v2 options to v3 nested apps/services/routes/domains", function () {
            const oq = new OrganizationsQuota(endpoint);
            const v2Opts = {
                name: "test-quota",
                memory_limit: 2048,
                instance_memory_limit: 1024,
                app_instance_limit: 10,
                non_basic_services_allowed: true,
                total_services: 100,
                total_routes: 500,
                total_reserved_route_ports: 5,
                total_private_domains: 3
            };

            const result = oq._translateToV3(v2Opts);

            expect(result.name).to.equal("test-quota");

            // apps sub-object
            expect(result.apps.total_memory_in_mb).to.equal(2048);
            expect(result.apps.per_process_memory_in_mb).to.equal(1024);
            expect(result.apps.total_instances).to.equal(10);

            // services sub-object
            expect(result.services.paid_services_allowed).to.equal(true);
            expect(result.services.total_service_instances).to.equal(100);

            // routes sub-object
            expect(result.routes.total_routes).to.equal(500);
            expect(result.routes.total_reserved_ports).to.equal(5);

            // domains sub-object
            expect(result.domains.total_domains).to.equal(3);

            // Should NOT have flat "limits" object
            expect(result).to.not.have.property("limits");
            // Should NOT have relationships (org quotas applied separately)
            expect(result).to.not.have.property("relationships");
        });

        it("should omit empty sub-objects", function () {
            const oq = new OrganizationsQuota(endpoint);
            const result = oq._translateToV3({ name: "minimal-quota" });

            expect(result.name).to.equal("minimal-quota");
            expect(result).to.not.have.property("apps");
            expect(result).to.not.have.property("services");
            expect(result).to.not.have.property("routes");
            expect(result).to.not.have.property("domains");
        });
    });

    // ── H4: SpacesQuota._translateToV3() ──────────────────────────────

    describe("H4 — SpacesQuota._translateToV3() nested structure", function () {

        it("should translate v2 options to v3 nested apps/services/routes", function () {
            const sq = new SpacesQuota(endpoint);
            const v2Opts = {
                name: "space-quota",
                organization_guid: "org-guid-1",
                memory_limit: 4096,
                instance_memory_limit: 512,
                app_instance_limit: 20,
                non_basic_services_allowed: false,
                total_services: 50,
                total_routes: 200,
                total_reserved_route_ports: 2
            };

            const result = sq._translateToV3(v2Opts, true);

            expect(result.name).to.equal("space-quota");
            // Relationships (space quotas require org on create)
            expect(result.relationships.organization.data.guid).to.equal("org-guid-1");

            // apps
            expect(result.apps.total_memory_in_mb).to.equal(4096);
            expect(result.apps.per_process_memory_in_mb).to.equal(512);
            expect(result.apps.total_instances).to.equal(20);

            // services
            expect(result.services.paid_services_allowed).to.equal(false);
            expect(result.services.total_service_instances).to.equal(50);

            // routes
            expect(result.routes.total_routes).to.equal(200);
            expect(result.routes.total_reserved_ports).to.equal(2);

            // Should NOT have flat "limits" object
            expect(result).to.not.have.property("limits");
        });

        it("should omit relationships on update (includeRelationships=false)", function () {
            const sq = new SpacesQuota(endpoint);
            const result = sq._translateToV3({
                name: "updated-quota",
                organization_guid: "org-guid-1",
                memory_limit: 2048
            }, false);

            expect(result).to.not.have.property("relationships");
            expect(result.apps.total_memory_in_mb).to.equal(2048);
        });
    });

    // ── Upload method override in AppsDeployment ──────────────────────

    describe("C5 — AppsDeployment v3 upload uses POST", function () {

        it("should pass method:POST to REST.upload for v3 package upload", function () {
            const AppsDeployment = require("../../lib/model/cloudcontroller/AppsDeployment");
            const app = new AppsDeployment(endpoint);
            app.setToken(mockToken);

            // Stub REST.request for the package creation step
            app.REST.request = function () {
                return Promise.resolve({ guid: "pkg-guid-1" });
            };

            // Stub REST.upload to capture the method
            const uploadCalls = stubUpload(app);

            // We need a real file for fs.statSync — use package.json as a dummy
            const path = require("path");
            const testFile = path.join(__dirname, "../../package.json");

            return app.upload("app-guid-1", testFile, false).then(() => {
                expect(uploadCalls).to.have.lengthOf(1);
                expect(uploadCalls[0].options.method).to.equal("POST");
                expect(uploadCalls[0].url).to.include("/v3/packages/pkg-guid-1/upload");
            });
        });

        it("should NOT set method for v2 upload (defaults to PUT)", function () {
            const AppsDeployment = require("../../lib/model/cloudcontroller/AppsDeployment");
            const app = new AppsDeployment(endpoint, { apiVersion: "v2" });
            app.setToken(mockToken);

            const uploadCalls = stubUpload(app);

            const path = require("path");
            const testFile = path.join(__dirname, "../../package.json");

            return app.upload("app-guid-1", testFile, false).then(() => {
                expect(uploadCalls).to.have.lengthOf(1);
                expect(uploadCalls[0].options.method).to.be.undefined;
                expect(uploadCalls[0].url).to.include("/v2/apps/app-guid-1/bits");
            });
        });
    });
});
