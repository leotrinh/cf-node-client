"use strict";
const { expect } = require("chai");
const UsersUAA = require("../../lib/model/uaa/UsersUAA");

describe("UAA safe user search and untrusted token claims", () => {
    let uaa;
    let calls;
    beforeEach(() => {
        uaa = new UsersUAA("https://uaa.example.org");
        uaa.setToken({ token_type: "Bearer", access_token: "synthetic" });
        calls = [];
        uaa.REST.request = (options) => {
            calls.push(options);
            return Promise.resolve({ resources: [] });
        };
    });

    it("keeps the legacy query-string form unchanged", async () => {
        await uaa.getUsers('?filter=userName eq "alice"');
        expect(calls[0].url).to.equal('https://uaa.example.org/Users?filter=userName eq "alice"');
        expect(calls[0]).not.to.have.property("qs");
    });

    it("passes object parameters through the query encoder", async () => {
        await uaa.getUsers({ filter: 'userName eq "a&b"', startIndex: 1, count: 25 });
        expect(calls[0].url).to.equal("https://uaa.example.org/Users");
        expect(calls[0].qs).to.deep.equal({ filter: 'userName eq "a&b"', startIndex: 1, count: 25 });
        const url = uaa.REST._buildUrl(calls[0].url, calls[0].qs);
        expect(new URL(url).searchParams.get("filter")).to.equal('userName eq "a&b"');
        expect(new URL(url).searchParams.get("count")).to.equal("25");
    });

    it("escapes username filter syntax and query delimiters", async () => {
        const malicious = 'bob" or userName pr&admin=true\\';
        await uaa.getUsersByUsername(malicious, { count: 10 });
        const filter = calls[0].qs.filter;
        expect(filter).to.equal(`userName eq ${JSON.stringify(malicious)}`);
        expect(JSON.parse(filter.slice("userName eq ".length))).to.equal(malicious);
        const url = new URL(uaa.REST._buildUrl(calls[0].url, calls[0].qs));
        expect(url.searchParams.get("admin")).to.equal(null);
        expect(url.searchParams.get("filter")).to.equal(filter);
        expect(url.searchParams.get("count")).to.equal("10");
    });

    it("does not manufacture API-key expiry, scope or identity", async () => {
        const token = await uaa.loginWithApiKey("  synthetic-key  ");
        expect(token).to.deep.equal({ token_type: "bearer", access_token: "synthetic-key" });
    });

    it("decodes but does not validate a forged JWT", () => {
        const forged = "header." + Buffer.from('{"admin":true}').toString("base64url") + ".fake";
        expect(uaa.decodeToken(forged)).to.deep.equal({ admin: true });
    });
});
