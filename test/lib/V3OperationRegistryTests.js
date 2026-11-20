"use strict";
const { expect } = require("chai");
const V3Api = require("../../lib/model/cloudcontroller/V3Api");

describe("Cloud Controller v3.237.0 operation registry", () => {
    const endpoint = "https://api.example.org";
    const client = new V3Api(endpoint);
    client.setToken({ token_type: "Bearer", access_token: "test" });
    const calls = [];
    client.REST.request = (options, status, json) => {
        calls.push({ options, status, json });
        return Promise.resolve({});
    };
    beforeEach(() => { calls.length = 0; });

    it("routes every documented method and path through the shared transport", async () => {
        for (const operation of V3Api.operations) {
            const params = Object.fromEntries([...operation.path.matchAll(/:([a-z_]+)/g)].map(match => [match[1], "test"]));
            const input = operation.method === "POST" || operation.method === "PATCH" || operation.method === "PUT"
                ? { params, body: { test: true } } : { params };
            await client.invoke(operation.anchor, input);
            const call = calls.pop();
            expect(call.options.method, operation.anchor).to.equal(operation.method);
            expect(call.options.url, operation.anchor).to.equal(`${endpoint}${operation.path.replace(/:[a-z_]+/g, "test")}`);
            expect(call.status, operation.anchor).to.deep.equal(operation.status);
        }
    });

    it("exposes unique documented operation anchors", () => {
        const operations = V3Api.operations;
        expect(operations).to.have.length(247);
        expect(new Set(operations.map(o => o.anchor)).size).to.equal(operations.length);
    });

    it("allows unauthenticated discovery of the API roots", async () => {
        const anonymous = new V3Api(endpoint);
        anonymous.REST.request = (options, status) => {
            expect(options.headers).not.to.have.property("Authorization");
            expect(status).to.equal(200);
            return Promise.resolve({});
        };
        await anonymous.invoke("global-api-root");
        await anonymous.invoke("v3-api-root");
    });

    it("creates a deployment with documented method and status", async () => {
        await client.invoke("create-a-deployment", { body: { strategy: "rolling" } });
        expect(calls[0].options).to.include({ method: "POST", url: `${endpoint}/v3/deployments` });
        expect(calls[0].options.body).to.equal('{"strategy":"rolling"}');
        expect(calls[0].status).to.equal(201);
    });

    it("encodes path variables and repeated query values", async () => {
        await client.invoke("list-running-security-groups-for-a-space", { params: { guid: "a/b" }, query: { names: ["a", "b"] } });
        expect(calls[0].options.url).to.equal(`${endpoint}/v3/spaces/a%2Fb/running_security_groups`);
        expect(calls[0].options.qs.names).to.deep.equal(["a", "b"]);
    });

    it("rejects absent path variables and unknown operations", () => {
        expect(() => client.invoke("get-a-deployment")).to.throw("Missing path parameters: guid");
        expect(() => client.invoke("not-an-operation")).to.throw("Unknown Cloud Foundry v3 operation");
    });

    it("supports documented alternate response statuses", async () => {
        await client.invoke("create-a-service-instance", { body: { type: "managed" } });
        expect(calls[0].status).to.deep.equal([202, 201]);
    });

    it("requests Buffer responses when binary mode is selected", async () => {
        await client.invoke("get-an-app", { params: { guid: "app" }, binary: true });
        expect(calls[0].options.encoding).to.equal(null);
        expect(calls[0].json).to.equal(false);
    });

    it("returns a redirect target without following it", async () => {
        await client.invoke("download-package-bits", { params: { guid: "pkg" } });
        expect(calls[0].options.redirect).to.equal("manual");
        expect(calls[0].status).to.equal(302);
    });

    it("preserves async-delete status and does not parse an empty response", async () => {
        await client.invoke("delete-an-app", { params: { guid: "app" } });
        expect(calls[0].status).to.equal(202);
        expect(calls[0].json).to.equal(false);
    });
});
