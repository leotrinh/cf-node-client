"use strict";
const { expect } = require("chai");
const http = require("http");
const FormData = require("form-data");
const V3Api = require("../../lib/model/cloudcontroller/V3Api");

describe("Cloud Controller v3 operation HTTP transport", () => {
    let server;
    let api;
    let requests;
    before(done => {
        requests = [];
        server = http.createServer((req, res) => {
            let data = "";
            req.on("data", chunk => { data += chunk.toString(); });
            req.on("end", () => {
                requests.push({ url: req.url, method: req.method, headers: req.headers, body: data });
                if (req.url.includes("/download")) {
                    res.writeHead(302, { Location: "https://files.example.org/file" });
                    res.end();
                } else if (req.url.includes("service_instances")) {
                    res.writeHead(202, { "Content-Type": "application/json", Location: "/v3/jobs/job-1" });
                    res.end('{"guid":"instance"}');
                } else if (req.url.includes("delete")) {
                    res.writeHead(204);
                    res.end();
                } else {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end('{"guid":"upload"}');
                }
            });
        });
        server.listen(0, "127.0.0.1", () => {
            api = new V3Api(`http://127.0.0.1:${server.address().port}`);
            api.setToken({ token_type: "Bearer", access_token: "synthetic" });
            done();
        });
    });
    after(done => server.close(done));

    it("sends multipart uploads without forcing JSON content type", async () => {
        const body = new FormData();
        body.append("bits", Buffer.from("synthetic"), "bits.zip");
        const value = await api.invoke("upload-package-bits", { params: { guid: "pkg" }, body });
        expect(value.guid).to.equal("upload");
        expect(requests.at(-1).headers["content-type"]).to.match(/^multipart\/form-data; boundary=/);
        expect(requests.at(-1).body).to.include("synthetic");
    });

    it("does not follow a download redirect with Authorization header", async () => {
        const result = await api.invoke("download-package-bits", { params: { guid: "pkg" } });
        expect(result).to.deep.equal({ status: 302, location: "https://files.example.org/file" });
        expect(requests.at(-1).headers.authorization).to.equal("Bearer synthetic");
    });

    it("accepts a documented asynchronous response variant", async () => {
        const result = await api.invoke("create-a-service-instance", {
            body: { type: "managed" }, responseMetadata: true
        });
        expect(result.status).to.equal(202);
        expect(result.location).to.equal("/v3/jobs/job-1");
        expect(result.body.guid).to.equal("instance");
    });
});
