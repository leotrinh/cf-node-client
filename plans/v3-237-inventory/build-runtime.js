"use strict";
const fs = require("fs");
const path = require("path");
const operations = require("./operations.json").operations;
const output = path.resolve(__dirname, "../../lib/model/cloudcontroller/v3-237-operations.json");
fs.writeFileSync(output, JSON.stringify(operations.map(({ anchor, method, path: route, status, exampleContentType, requiredParameters }) => ({ anchor, method, path: route, status, exampleContentType, requiredParameters })), null, 2) + "\n");
console.log(`Bundled ${operations.length} versioned operation definitions`);
