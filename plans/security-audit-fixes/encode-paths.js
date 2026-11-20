"use strict";
// Repeatable, deliberately narrow migration of URL templates; never rewrite filter body templates.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "../../lib/model");
const identifiers = /\$\{(guid|appGuid|routeGuid|serviceGuid|serviceBindingGuid|spaceGuid|orgGuid|uaaGuid|flag|jobGuid|instanceGuid|userGuid|dropletGuid|sourcePackageGuid)\}/g;
let filesChanged = 0, segmentsEncoded = 0;
for (const directory of ["cloudcontroller", "metrics", "uaa"]) {
    for (const filename of fs.readdirSync(path.join(root, directory)).filter(name => name.endsWith(".js"))) {
        const full = path.join(root, directory, filename);
        const before = fs.readFileSync(full, "utf8");
        const after = before.replace(/`\$\{this\.API_URL\}[^`]*`/g, template => template.replace(identifiers, (_, name) => {
            segmentsEncoded++;
            return "${encodeURIComponent(String(" + name + "))}";
        }));
        if (before !== after) {
            fs.writeFileSync(full, after);
            filesChanged++;
        }
    }
}
console.log(`Encoded ${segmentsEncoded} URL interpolations across ${filesChanged} files`);
