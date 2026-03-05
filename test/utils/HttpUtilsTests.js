/*jslint node: true*/
/*global describe: true, it: true, before: true, after: true*/
"use strict";

const { expect } = require("chai");
const http = require("http");
const HttpUtils = require("../../lib/utils/HttpUtils");

describe("HttpUtils", function () {

    let server;
    let baseUrl;
    const httpUtils = new HttpUtils();

    before(function (done) {
        server = http.createServer(function (req, res) {
            if (req.url === "/json") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ status: "ok", api: "v2" }));
            } else if (req.url === "/text") {
                res.writeHead(200, { "Content-Type": "text/plain" });
                res.end("plain text response");
            } else if (req.url === "/error500") {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "internal server error" }));
            } else {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "not found" }));
            }
        });
        server.listen(0, function () {
            const port = server.address().port;
            baseUrl = `http://127.0.0.1:${port}`;
            done();
        });
    });

    after(function (done) {
        server.close(done);
    });

    it("should handle HTTP 200 response as string", function () {
        const options = { method: "GET", url: `${baseUrl}/text` };
        return httpUtils.request(options, 200, false).then(function (result) {
            expect(result).to.be.a("string");
            expect(result).to.include("plain text response");
        });
    });

    it("should handle HTTP 200 response as JSON", function () {
        const options = { method: "GET", url: `${baseUrl}/json` };
        return httpUtils.request(options, 200, true).then(function (result) {
            expect(result).to.be.an("object");
            expect(result.status).to.equal("ok");
            expect(result.api).to.equal("v2");
        });
    });

    it("should handle HTTP 404 response", function () {
        const options = { method: "GET", url: `${baseUrl}/unknown` };
        return httpUtils.request(options, 404, false).then(function (result) {
            expect(result).to.be.a("string");
        });
    });

    it("should reject when expected status does not match", function () {
        const options = { method: "GET", url: `${baseUrl}/json` };
        return httpUtils.request(options, 404, false).then(function () {
            throw new Error("Should have rejected");
        }).catch(function (err) {
            expect(err).to.exist;
        });
    });

    it("should reject on connection error", function () {
        const options = { method: "GET", url: "http://127.0.0.1:1" };
        return httpUtils.request(options, 200, false).then(function () {
            throw new Error("Should have rejected");
        }).catch(function (err) {
            expect(err).to.exist;
        });
    });
});