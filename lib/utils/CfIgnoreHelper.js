"use strict";

const fs = require("fs");
const path = require("path");

/**
 * CfIgnoreHelper — parses `.cfignore` files and filters file lists.
 * `.cfignore` uses the same syntax as `.gitignore`.
 *
 * This is a lightweight implementation that handles common patterns:
 * - Exact file/directory names
 * - Wildcard patterns (* and **)
 * - Negation patterns (!)
 * - Comments (#)
 * - Directory-only patterns (trailing /)
 *
 * @class
 */
class CfIgnoreHelper {

    /**
     * Create a CfIgnoreHelper from a .cfignore file path.
     *
     * @param {String} cfIgnorePath - Path to the .cfignore file
     * @return {CfIgnoreHelper} Instance with parsed patterns
     */
    static fromFile(cfIgnorePath) {
        const helper = new CfIgnoreHelper();
        if (fs.existsSync(cfIgnorePath)) {
            const content = fs.readFileSync(cfIgnorePath, "utf8");
            helper.addPatterns(content);
        }
        return helper;
    }

    /**
     * Create a CfIgnoreHelper from a directory (looks for .cfignore in it).
     *
     * @param {String} dirPath - Directory to look for .cfignore in
     * @return {CfIgnoreHelper} Instance with parsed patterns
     */
    static fromDirectory(dirPath) {
        return CfIgnoreHelper.fromFile(path.join(dirPath, ".cfignore"));
    }

    constructor() {
        /** @type {Array<{pattern: RegExp, negate: Boolean, dirOnly: Boolean}>} */
        this._rules = [];
    }

    /**
     * Parse and add patterns from a .cfignore content string.
     *
     * @param {String} content - .cfignore file content
     * @return {CfIgnoreHelper} this (for chaining)
     */
    addPatterns(content) {
        if (!content || typeof content !== "string") return this;

        const lines = content.split(/\r?\n/);
        for (const rawLine of lines) {
            const line = rawLine.trim();

            // Skip empty lines and comments
            if (!line || line.startsWith("#")) continue;

            let pattern = line;
            let negate = false;
            let dirOnly = false;

            // Negation
            if (pattern.startsWith("!")) {
                negate = true;
                pattern = pattern.slice(1);
            }

            // Directory-only pattern
            if (pattern.endsWith("/")) {
                dirOnly = true;
                pattern = pattern.slice(0, -1);
            }

            // Strip leading slash (anchors to root but we match relative paths)
            if (pattern.startsWith("/")) {
                pattern = pattern.slice(1);
            }

            const regex = CfIgnoreHelper._patternToRegex(pattern);
            this._rules.push({ pattern: regex, negate, dirOnly });
        }

        return this;
    }

    /**
     * Check if a relative file path should be ignored.
     *
     * @param {String} relativePath - File path relative to the project root
     * @param {Boolean} [isDirectory=false] - Whether the path is a directory
     * @return {Boolean} True if the path should be ignored
     */
    isIgnored(relativePath, isDirectory = false) {
        // Normalize to forward slashes
        const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
        let ignored = false;

        for (const rule of this._rules) {
            if (rule.dirOnly && !isDirectory) continue;

            if (rule.pattern.test(normalized)) {
                ignored = !rule.negate;
            }
        }

        return ignored;
    }

    /**
     * Filter a list of file paths, removing ignored ones.
     *
     * @param {Array<String>} filePaths - Array of relative file paths
     * @return {Array<String>} Paths that are NOT ignored
     */
    filter(filePaths) {
        return filePaths.filter(fp => !this.isIgnored(fp));
    }

    /**
     * Convert a gitignore-style glob pattern to a RegExp.
     *
     * @param {String} pattern - Glob pattern
     * @return {RegExp} Equivalent regular expression
     * @private
     * @static
     */
    static _patternToRegex(pattern) {
        let regexStr = "";
        let i = 0;

        // If pattern doesn't contain /, it matches against the filename component
        const matchAnywhere = !pattern.includes("/");

        while (i < pattern.length) {
            const c = pattern[i];

            if (c === "*") {
                if (pattern[i + 1] === "*") {
                    // ** matches everything including /
                    if (pattern[i + 2] === "/") {
                        regexStr += "(?:.+/)?";
                        i += 3;
                    } else {
                        regexStr += ".*";
                        i += 2;
                    }
                } else {
                    // * matches everything except /
                    regexStr += "[^/]*";
                    i++;
                }
            } else if (c === "?") {
                regexStr += "[^/]";
                i++;
            } else if (c === "[") {
                // Character class — pass through to regex
                const closeIdx = pattern.indexOf("]", i + 1);
                if (closeIdx !== -1) {
                    regexStr += pattern.slice(i, closeIdx + 1);
                    i = closeIdx + 1;
                } else {
                    regexStr += "\\[";
                    i++;
                }
            } else {
                // Escape regex special chars
                regexStr += c.replace(/[.+^${}()|\\]/g, "\\$&");
                i++;
            }
        }

        if (matchAnywhere) {
            // Match against any path component or the full path
            return new RegExp(`(?:^|/)${regexStr}(?:/|$)`);
        }

        return new RegExp(`^${regexStr}(?:/.*)?$`);
    }
}

module.exports = CfIgnoreHelper;
