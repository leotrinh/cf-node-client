/**
 * Unit tests for convenience findByName methods.
 * Uses stub on REST.request() — no live CF API needed.
 */

"use strict";

const { expect } = require("chai");
const Organizations = require("../../lib/model/cloudcontroller/Organizations");
const Spaces = require("../../lib/model/cloudcontroller/Spaces");
const Apps = require("../../lib/model/cloudcontroller/Apps");
const ServiceInstances = require("../../lib/model/cloudcontroller/ServiceInstances");

// ── Helpers ────────────────────────────────────────────────────────────

const endpoint = "https://api.example.com";
const mockToken = { token_type: "Bearer", access_token: "test_token" };

/** Build a v2 paginated response */
function v2Response(resources) {
    return {
        total_results: resources.length,
        total_pages: 1,
        resources: resources
    };
}

/** Build a v3 paginated response */
function v3Response(resources) {
    return {
        pagination: { total_results: resources.length, total_pages: 1 },
        resources: resources
    };
}

/** Create a v2 resource object */
function v2Resource(guid, name, extra) {
    return {
        metadata: { guid: guid },
        entity: Object.assign({ name: name }, extra || {})
    };
}

/** Create a v3 resource object */
function v3Resource(guid, name, extra) {
    return Object.assign({ guid: guid, name: name }, extra || {});
}

/**
 * Stub REST.request to capture call args and return canned response.
 * Returns an object with { calls, setResponse }.
 */
function stubRest(model) {
    let response = v2Response([]);
    const calls = [];
    model.REST.request = function (options, expectedStatus, parseJson) {
        calls.push({ options, expectedStatus, parseJson });
        return Promise.resolve(response);
    };
    return {
        calls,
        setResponse(res) { response = res; }
    };
}

// ── Tests ──────────────────────────────────────────────────────────────

describe("Convenience Methods — getByName", function () {
    this.timeout(5000);

    // ── Organizations ──────────────────────────────────────────────────

    describe("Organizations.getOrganizationByName()", function () {

        it("should find org by name (v3)", function () {
            const org = new Organizations(endpoint);
            org.setToken(mockToken);
            const stub = stubRest(org);
            const expected = v3Resource("guid-1", "my-org");
            stub.setResponse(v3Response([expected]));

            return org.getOrganizationByName("my-org").then(result => {
                expect(result).to.deep.equal(expected);
                expect(stub.calls).to.have.lengthOf(1);
                expect(stub.calls[0].options.qs).to.deep.include({ names: "my-org" });
            });
        });

        it("should find org by name (v2)", function () {
            const org = new Organizations(endpoint, { apiVersion: "v2" });
            org.setToken(mockToken);
            const stub = stubRest(org);
            const expected = v2Resource("guid-1", "my-org");
            stub.setResponse(v2Response([expected]));

            return org.getOrganizationByName("my-org").then(result => {
                expect(result).to.deep.equal(expected);
                expect(stub.calls[0].options.qs.q).to.equal("name:my-org");
            });
        });

        it("should return null when org not found", function () {
            const org = new Organizations(endpoint);
            org.setToken(mockToken);
            const stub = stubRest(org);
            stub.setResponse(v3Response([]));

            return org.getOrganizationByName("non-existent").then(result => {
                expect(result).to.be.null;
            });
        });

        it("should reject for empty name", function () {
            const org = new Organizations(endpoint);
            org.setToken(mockToken);

            return org.getOrganizationByName("").then(
                () => { throw new Error("Should have rejected"); },
                err => { expect(err.message).to.include("non-empty string"); }
            );
        });
    });

    // ── Spaces ─────────────────────────────────────────────────────────

    describe("Spaces.getSpaceByName()", function () {

        it("should find space by name (v3)", function () {
            const spaces = new Spaces(endpoint);
            spaces.setToken(mockToken);
            const stub = stubRest(spaces);
            const expected = v3Resource("space-1", "dev");
            stub.setResponse(v3Response([expected]));

            return spaces.getSpaceByName("dev").then(result => {
                expect(result).to.deep.equal(expected);
                expect(stub.calls[0].options.qs).to.deep.include({ names: "dev" });
            });
        });

        it("should find space by name (v2)", function () {
            const spaces = new Spaces(endpoint, { apiVersion: "v2" });
            spaces.setToken(mockToken);
            const stub = stubRest(spaces);
            const expected = v2Resource("space-1", "dev");
            stub.setResponse(v2Response([expected]));

            return spaces.getSpaceByName("dev").then(result => {
                expect(result).to.deep.equal(expected);
                expect(stub.calls[0].options.qs.q).to.deep.include("name:dev");
            });
        });

        it("should filter by orgGuid (v3)", function () {
            const spaces = new Spaces(endpoint);
            spaces.setToken(mockToken);
            const stub = stubRest(spaces);
            stub.setResponse(v3Response([v3Resource("space-1", "dev")]));

            return spaces.getSpaceByName("dev", "org-guid-1").then(() => {
                const qs = stub.calls[0].options.qs;
                expect(qs.names).to.equal("dev");
                expect(qs.organization_guids).to.equal("org-guid-1");
            });
        });

        it("should filter by orgGuid (v2)", function () {
            const spaces = new Spaces(endpoint, { apiVersion: "v2" });
            spaces.setToken(mockToken);
            const stub = stubRest(spaces);
            stub.setResponse(v2Response([v2Resource("space-1", "dev")]));

            return spaces.getSpaceByName("dev", "org-guid-1").then(() => {
                const qs = stub.calls[0].options.qs;
                expect(qs.q).to.deep.include("name:dev");
                expect(qs.q).to.deep.include("organization_guid:org-guid-1");
            });
        });

        it("should return null when space not found", function () {
            const spaces = new Spaces(endpoint);
            spaces.setToken(mockToken);
            stubRest(spaces);

            return spaces.getSpaceByName("ghost").then(result => {
                expect(result).to.be.null;
            });
        });

        it("should reject for empty name", function () {
            const spaces = new Spaces(endpoint);
            spaces.setToken(mockToken);

            return spaces.getSpaceByName("").then(
                () => { throw new Error("Should have rejected"); },
                err => { expect(err.message).to.include("non-empty string"); }
            );
        });
    });

    // ── Apps ───────────────────────────────────────────────────────────

    describe("Apps.getAppByName()", function () {

        it("should find app by name (v3)", function () {
            const apps = new Apps(endpoint);
            apps.setToken(mockToken);
            const stub = stubRest(apps);
            const expected = v3Resource("app-1", "my-app");
            stub.setResponse(v3Response([expected]));

            return apps.getAppByName("my-app").then(result => {
                expect(result).to.deep.equal(expected);
                expect(stub.calls[0].options.qs).to.deep.include({ names: "my-app" });
            });
        });

        it("should find app by name (v2)", function () {
            const apps = new Apps(endpoint, { apiVersion: "v2" });
            apps.setToken(mockToken);
            const stub = stubRest(apps);
            const expected = v2Resource("app-1", "my-app");
            stub.setResponse(v2Response([expected]));

            return apps.getAppByName("my-app").then(result => {
                expect(result).to.deep.equal(expected);
            });
        });

        it("should filter by spaceGuid (v3)", function () {
            const apps = new Apps(endpoint);
            apps.setToken(mockToken);
            const stub = stubRest(apps);
            stub.setResponse(v3Response([v3Resource("app-1", "my-app")]));

            return apps.getAppByName("my-app", "space-guid-1").then(() => {
                const qs = stub.calls[0].options.qs;
                expect(qs.names).to.equal("my-app");
                expect(qs.space_guids).to.equal("space-guid-1");
            });
        });

        it("should return null when app not found", function () {
            const apps = new Apps(endpoint);
            apps.setToken(mockToken);
            stubRest(apps);

            return apps.getAppByName("non-existent").then(result => {
                expect(result).to.be.null;
            });
        });

        it("should reject for empty name", function () {
            const apps = new Apps(endpoint);
            apps.setToken(mockToken);

            return apps.getAppByName("").then(
                () => { throw new Error("Should have rejected"); },
                err => { expect(err.message).to.include("non-empty string"); }
            );
        });
    });

    // ── ServiceInstances ───────────────────────────────────────────────

    describe("ServiceInstances.getInstanceByName()", function () {

        it("should find service instance by name (v3)", function () {
            const si = new ServiceInstances(endpoint);
            si.setToken(mockToken);
            const stub = stubRest(si);
            const expected = v3Resource("si-1", "my-db");
            stub.setResponse(v3Response([expected]));

            return si.getInstanceByName("my-db").then(result => {
                expect(result).to.deep.equal(expected);
                expect(stub.calls[0].options.qs).to.deep.include({ names: "my-db" });
            });
        });

        it("should find service instance by name (v2)", function () {
            const si = new ServiceInstances(endpoint, { apiVersion: "v2" });
            si.setToken(mockToken);
            const stub = stubRest(si);
            const expected = v2Resource("si-1", "my-db");
            stub.setResponse(v2Response([expected]));

            return si.getInstanceByName("my-db").then(result => {
                expect(result).to.deep.equal(expected);
            });
        });

        it("should filter by spaceGuid (v3)", function () {
            const si = new ServiceInstances(endpoint);
            si.setToken(mockToken);
            const stub = stubRest(si);
            stub.setResponse(v3Response([v3Resource("si-1", "my-db")]));

            return si.getInstanceByName("my-db", "space-guid-1").then(() => {
                const qs = stub.calls[0].options.qs;
                expect(qs.names).to.equal("my-db");
                expect(qs.space_guids).to.equal("space-guid-1");
            });
        });

        it("should return null when not found", function () {
            const si = new ServiceInstances(endpoint);
            si.setToken(mockToken);
            stubRest(si);

            return si.getInstanceByName("ghost").then(result => {
                expect(result).to.be.null;
            });
        });

        it("should reject for empty name", function () {
            const si = new ServiceInstances(endpoint);
            si.setToken(mockToken);

            return si.getInstanceByName("").then(
                () => { throw new Error("Should have rejected"); },
                err => { expect(err.message).to.include("non-empty string"); }
            );
        });
    });
});
