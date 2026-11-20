"use strict";
const { expect } = require("chai");
const CloudControllerBase = require("../../lib/model/cloudcontroller/CloudControllerBase");
const UsersUAA = require("../../lib/model/uaa/UsersUAA");
const HttpUtils = require("../../lib/utils/HttpUtils");
const Jobs = require("../../lib/model/cloudcontroller/Jobs");
const AppsCopy = require("../../lib/model/cloudcontroller/AppsCopy");

describe("1.1.0 security defaults", () => {
    it("verifies TLS certificates by default for requests and uploads", () => {
        const client = new CloudControllerBase("https://api.example.org");
        expect(client.REST.httpsAgent.options.rejectUnauthorized).to.equal(true);
        expect(new HttpUtils().httpsAgent.options.rejectUnauthorized).to.equal(true);
    });

    it("supports explicit opt-in for self-signed CF and a custom CA per instance", () => {
        const ca = "-----BEGIN CERTIFICATE-----\nsynthetic\n-----END CERTIFICATE-----";
        const client = new CloudControllerBase("https://api.example.org", { skipSslValidation: true });
        expect(client.REST.httpsAgent.options.rejectUnauthorized).to.equal(false);
        const secured = new UsersUAA("https://uaa.example.org", { ca });
        expect(secured.REST.httpsAgent.options.rejectUnauthorized).to.equal(true);
        expect(secured.REST.httpsAgent.options.ca).to.equal(ca);
    });

    it("rejects remote HTTP unless explicitly enabled but permits loopback", () => {
        expect(() => new CloudControllerBase("http://api.example.org")).to.throw("Invalid endpoint");
        expect(() => new CloudControllerBase("http://localhost:8080")).not.to.throw();
        expect(() => new CloudControllerBase("http://127.0.0.1:8080")).not.to.throw();
        expect(() => new CloudControllerBase("http://api.example.org", { allowInsecureHttp: true })).not.to.throw();
        const client = new CloudControllerBase("https://api.example.org");
        expect(() => client.setEndPoint("http://api.example.org")).to.throw("Invalid endpoint");
    });

    it("encodes untrusted path and query segments without changing the route", async () => {
        const base = new CloudControllerBase("https://api.example.org");
        expect(base.buildResourceUrl("apps", "../tasks?x=y"))
            .to.include("/apps/..%2Ftasks%3Fx%3Dy");
        const job = new Jobs("https://api.example.org");
        job.setToken({ access_token: "synthetic" });
        let url;
        job.REST.requestV3 = (_method, target) => { url = target; return Promise.resolve({}); };
        await job.getV3Job("../service_credential_bindings/x/details?foo=bar");
        expect(url).to.include("/v3/jobs/..%2Fservice_credential_bindings%2Fx%2Fdetails%3Ffoo%3Dbar");
        const copy = new AppsCopy("https://api.example.org");
        copy.setToken({ access_token: "synthetic" });
        copy.REST.requestV3 = (_method, target) => { url = target; return Promise.resolve({}); };
        await copy.copyPackage("source&evil=true", "target");
        expect(url).to.include("?source_guid=source%26evil%3Dtrue");
    });

    it("clears cached data when token or endpoint changes", () => {
        const client = new CloudControllerBase("https://api.example.org", { cache: true });
        client._cache.set("private", { guid: "alice" });
        client.setToken({ access_token: "bob" });
        expect(client._cache.get("private")).to.equal(undefined);
        client._cache.set("private", { guid: "bob" });
        client.setEndPoint("https://other.example.org");
        expect(client._cache.get("private")).to.equal(undefined);
    });
});
