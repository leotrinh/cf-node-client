/**
 * Unit tests for:
 *   1. getAllResources() auto-pagination (v2 + v3)
 *   2. getAllOrganizations / getAllSpaces / getAllApps / getAllInstances
 *   3. CacheService + cache integration in CloudControllerBase
 */

"use strict";

const { expect } = require("chai");
const CacheService = require("../../lib/services/CacheService");
const Organizations = require("../../lib/model/cloudcontroller/Organizations");
const Spaces = require("../../lib/model/cloudcontroller/Spaces");
const Apps = require("../../lib/model/cloudcontroller/Apps");
const ServiceInstances = require("../../lib/model/cloudcontroller/ServiceInstances");

// ── Helpers ────────────────────────────────────────────────────────────

const endpoint = "https://api.example.com";
const mockToken = { token_type: "Bearer", access_token: "test_token" };

function v2Page(resources, hasNext) {
    return {
        total_results: resources.length,
        total_pages: hasNext ? 2 : 1,
        next_url: hasNext ? "/v2/next" : null,
        resources: resources
    };
}

function v3Page(resources, hasNext) {
    return {
        pagination: {
            total_results: resources.length,
            total_pages: hasNext ? 2 : 1,
            next: hasNext ? { href: "/v3/next" } : null
        },
        resources: resources
    };
}

function v2Resource(guid, name) {
    return { metadata: { guid: guid }, entity: { name: name } };
}

function v3Resource(guid, name) {
    return { guid: guid, name: name };
}

/**
 * Stub REST.request to return a sequence of canned responses.
 * Returns an object with { calls }.
 */
function stubRestSequence(model, responses) {
    let callIndex = 0;
    const calls = [];
    model.REST.request = function (options) {
        calls.push(options);
        const resp = responses[callIndex] || responses[responses.length - 1];
        callIndex++;
        return Promise.resolve(resp);
    };
    return { calls };
}

// ── CacheService unit tests ───────────────────────────────────────────

describe("CacheService", function () {

    it("should store and retrieve a value", function () {
        const cache = new CacheService({ ttl: 5000 });
        cache.set("key1", "value1");
        expect(cache.get("key1")).to.equal("value1");
    });

    it("should return undefined for missing key", function () {
        const cache = new CacheService();
        expect(cache.get("nope")).to.equal(undefined);
    });

    it("should return undefined for expired entry", function (done) {
        const cache = new CacheService({ ttl: 20 });
        cache.set("key1", "value1");
        setTimeout(function () {
            expect(cache.get("key1")).to.equal(undefined);
            done();
        }, 40);
    });

    it("should report has() correctly", function () {
        const cache = new CacheService({ ttl: 5000 });
        expect(cache.has("key1")).to.equal(false);
        cache.set("key1", 42);
        expect(cache.has("key1")).to.equal(true);
    });

    it("should delete a single entry", function () {
        const cache = new CacheService({ ttl: 5000 });
        cache.set("a", 1);
        cache.set("b", 2);
        cache.delete("a");
        expect(cache.has("a")).to.equal(false);
        expect(cache.has("b")).to.equal(true);
    });

    it("should clear all entries", function () {
        const cache = new CacheService({ ttl: 5000 });
        cache.set("a", 1);
        cache.set("b", 2);
        cache.clear();
        expect(cache.size).to.equal(0);
    });

    it("should invalidate by prefix", function () {
        const cache = new CacheService({ ttl: 5000 });
        cache.set("orgs:page1", 1);
        cache.set("orgs:page2", 2);
        cache.set("spaces:page1", 3);
        cache.invalidateByPrefix("orgs:");
        expect(cache.has("orgs:page1")).to.equal(false);
        expect(cache.has("orgs:page2")).to.equal(false);
        expect(cache.has("spaces:page1")).to.equal(true);
    });

    it("should allow custom TTL per entry", function (done) {
        const cache = new CacheService({ ttl: 5000 });
        cache.set("short", "val", 20);
        cache.set("long", "val", 5000);
        setTimeout(function () {
            expect(cache.has("short")).to.equal(false);
            expect(cache.has("long")).to.equal(true);
            done();
        }, 40);
    });
});

// ── getAllResources pagination tests ───────────────────────────────────

describe("getAllResources — Auto-Pagination", function () {
    this.timeout(5000);

    describe("v3 mode", function () {

        it("should return all resources from a single page", function () {
            const orgs = new Organizations(endpoint);
            orgs.setToken(mockToken);
            const page1 = v3Page([v3Resource("g1", "org1"), v3Resource("g2", "org2")], false);
            stubRestSequence(orgs, [page1]);

            return orgs.getAllOrganizations().then(function (result) {
                expect(result).to.be.an("array").with.length(2);
                expect(result[0].name).to.equal("org1");
                expect(result[1].name).to.equal("org2");
            });
        });

        it("should paginate through multiple pages", function () {
            const orgs = new Organizations(endpoint);
            orgs.setToken(mockToken);
            const page1 = v3Page([v3Resource("g1", "org1")], true);
            const page2 = v3Page([v3Resource("g2", "org2")], false);
            stubRestSequence(orgs, [page1, page2]);

            return orgs.getAllOrganizations().then(function (result) {
                expect(result).to.be.an("array").with.length(2);
                expect(result[0].name).to.equal("org1");
                expect(result[1].name).to.equal("org2");
            });
        });

        it("should return empty array when no resources", function () {
            const orgs = new Organizations(endpoint);
            orgs.setToken(mockToken);
            stubRestSequence(orgs, [v3Page([], false)]);

            return orgs.getAllOrganizations().then(function (result) {
                expect(result).to.be.an("array").with.length(0);
            });
        });
    });

    describe("v2 mode", function () {

        it("should paginate through multiple pages (v2)", function () {
            const orgs = new Organizations(endpoint, { apiVersion: "v2" });
            orgs.setToken(mockToken);
            const page1 = v2Page([v2Resource("g1", "org1")], true);
            const page2 = v2Page([v2Resource("g2", "org2")], false);
            stubRestSequence(orgs, [page1, page2]);

            return orgs.getAllOrganizations().then(function (result) {
                expect(result).to.be.an("array").with.length(2);
                expect(result[0].entity.name).to.equal("org1");
                expect(result[1].entity.name).to.equal("org2");
            });
        });
    });

    describe("Spaces.getAllSpaces()", function () {

        it("should paginate all spaces", function () {
            const spaces = new Spaces(endpoint);
            spaces.setToken(mockToken);
            const page1 = v3Page([v3Resource("s1", "dev")], true);
            const page2 = v3Page([v3Resource("s2", "prod")], false);
            stubRestSequence(spaces, [page1, page2]);

            return spaces.getAllSpaces().then(function (result) {
                expect(result).to.have.length(2);
                expect(result[0].name).to.equal("dev");
                expect(result[1].name).to.equal("prod");
            });
        });
    });

    describe("Apps.getAllApps()", function () {

        it("should paginate all apps", function () {
            const apps = new Apps(endpoint);
            apps.setToken(mockToken);
            const page1 = v3Page([v3Resource("a1", "app1"), v3Resource("a2", "app2")], true);
            const page2 = v3Page([v3Resource("a3", "app3")], false);
            stubRestSequence(apps, [page1, page2]);

            return apps.getAllApps().then(function (result) {
                expect(result).to.have.length(3);
            });
        });
    });

    describe("ServiceInstances.getAllInstances()", function () {

        it("should paginate all instances", function () {
            const si = new ServiceInstances(endpoint);
            si.setToken(mockToken);
            const page1 = v3Page([v3Resource("i1", "db1")], true);
            const page2 = v3Page([v3Resource("i2", "db2")], false);
            stubRestSequence(si, [page1, page2]);

            return si.getAllInstances().then(function (result) {
                expect(result).to.have.length(2);
                expect(result[0].name).to.equal("db1");
            });
        });
    });

    describe("with filter passthrough", function () {

        it("should merge user filter with pagination params", function () {
            const spaces = new Spaces(endpoint);
            spaces.setToken(mockToken);
            const stub = stubRestSequence(spaces, [v3Page([v3Resource("s1", "dev")], false)]);

            return spaces.getAllSpaces({ organization_guids: "org-1" }).then(function () {
                const qs = stub.calls[0].qs;
                expect(qs.organization_guids).to.equal("org-1");
                expect(qs.page).to.equal(1);
                expect(qs.per_page).to.equal(200);
            });
        });
    });
});

// ── Cache integration tests ───────────────────────────────────────────

describe("Cache Integration — CloudControllerBase", function () {
    this.timeout(5000);

    it("should not cache by default", function () {
        const orgs = new Organizations(endpoint);
        orgs.setToken(mockToken);
        let callCount = 0;
        orgs.REST.request = function () {
            callCount++;
            return Promise.resolve(v3Page([v3Resource("g1", "org1")], false));
        };

        return orgs.getAllOrganizations()
            .then(function () { return orgs.getAllOrganizations(); })
            .then(function () {
                expect(callCount).to.equal(2); // no cache = 2 API calls
            });
    });

    it("should cache results when cache is enabled", function () {
        const orgs = new Organizations(endpoint, { cache: true, cacheTTL: 5000 });
        orgs.setToken(mockToken);
        let callCount = 0;
        orgs.REST.request = function () {
            callCount++;
            return Promise.resolve(v3Page([v3Resource("g1", "org1")], false));
        };

        return orgs.getAllOrganizations()
            .then(function () { return orgs.getAllOrganizations(); })
            .then(function (result) {
                expect(callCount).to.equal(1); // cached = only 1 API call
                expect(result).to.have.length(1);
            });
    });

    it("should return fresh data after clearCache()", function () {
        const orgs = new Organizations(endpoint, { cache: true, cacheTTL: 5000 });
        orgs.setToken(mockToken);
        let callCount = 0;
        orgs.REST.request = function () {
            callCount++;
            return Promise.resolve(v3Page([v3Resource("g" + callCount, "org" + callCount)], false));
        };

        return orgs.getAllOrganizations()
            .then(function () {
                orgs.clearCache();
                return orgs.getAllOrganizations();
            })
            .then(function (result) {
                expect(callCount).to.equal(2);
                expect(result[0].name).to.equal("org2");
            });
    });

    it("should stop caching after disableCache()", function () {
        const orgs = new Organizations(endpoint, { cache: true });
        orgs.setToken(mockToken);
        let callCount = 0;
        orgs.REST.request = function () {
            callCount++;
            return Promise.resolve(v3Page([v3Resource("g1", "org1")], false));
        };

        return orgs.getAllOrganizations()
            .then(function () {
                orgs.disableCache();
                return orgs.getAllOrganizations();
            })
            .then(function () { return orgs.getAllOrganizations(); })
            .then(function () {
                expect(callCount).to.equal(3); // 1 cached + 2 uncached
            });
    });

    it("should re-enable cache with enableCache()", function () {
        const orgs = new Organizations(endpoint);
        orgs.setToken(mockToken);
        let callCount = 0;
        orgs.REST.request = function () {
            callCount++;
            return Promise.resolve(v3Page([v3Resource("g1", "org1")], false));
        };

        return orgs.getAllOrganizations()
            .then(function () { return orgs.getAllOrganizations(); })
            .then(function () {
                expect(callCount).to.equal(2); // no cache
                orgs.enableCache(5000);
                return orgs.getAllOrganizations();
            })
            .then(function () { return orgs.getAllOrganizations(); })
            .then(function () {
                expect(callCount).to.equal(3); // 2 + 1 (cached second call)
            });
    });
});
