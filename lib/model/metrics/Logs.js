"use strict";

const CloudControllerBase = require("../cloudcontroller/CloudControllerBase");

/**
 * Logs — CF log retrieval and parsing.
 * Extends CloudControllerBase for shared HttpUtils / HttpStatus / token management.
 * {@link https://docs.pivotal.io/pivotalcf/devguide/deploy-apps/streaming-logs.html}
 *
 * @class
 */
class Logs extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - Logging endpoint URL
     */
    constructor(endPoint) {
        super(endPoint);
    }

    /**
     * Get raw recent logs for an application.
     * @param {String} appGuid - Application GUID
     * @return {Promise<String>} Raw log string
     */
    getRecent(appGuid) {
        const options = {
            method: "GET",
            url: `${this.API_URL}/recent?app=${appGuid}`,
            headers: { Authorization: this.getAuthorizationHeader() }
        };
        return this.REST.request(options, this.HttpStatus.OK, false);
    }

    /**
     * Get recent logs parsed into structured objects.
     * @param {String} appGuid - Application GUID
     * @return {Promise<Array>} Array of structured log entries
     */
    getRecentParsed(appGuid) {
        return this.getRecent(appGuid).then(rawLogs => {
            if (!rawLogs || typeof rawLogs !== "string") return [];
            return Logs.parseLogs(rawLogs);
        });
    }

    /**
     * Parse raw CF log output into structured entries.
     * @param {String} rawLogs - Newline-separated log string
     * @return {Array} Array of { timestamp, timestampRaw, source, sourceId, messageType, message }
     * @static
     */
    static parseLogs(rawLogs) {
        if (!rawLogs || typeof rawLogs !== "string") return [];

        const lines = rawLogs.split("\n").filter(line => line.trim().length > 0);
        const logPattern = /^(\S+)\s+\[([^\]]+)\]\s+(OUT|ERR)\s+(.*)$/;

        return lines.map(line => {
            const match = line.match(logPattern);
            if (match) {
                const [, timestampRaw, sourceInfo, messageType, message] = match;
                const sourceParts = sourceInfo.split("/");
                const source = sourceParts[0] || "";
                const sourceId = sourceParts.slice(1).join("/") || "0";
                
                // Enhanced timestamp parsing for RFC3339/ISO8601 formats
                let timestamp = null;
                try {
                    // Handle RFC3339 with timezone (e.g., 2024-01-15T14:30:00.123Z or 2024-01-15T14:30:00+01:00)
                    // Handle ISO8601 formats (e.g., 2024-01-15T14:30:00)
                    // Also handles epoch milliseconds and other standard formats
                    const parsed = new Date(timestampRaw);
                    if (!isNaN(parsed.getTime())) {
                        timestamp = parsed;
                    }
                } catch (_) { /* keep null */ }
                
                return { timestamp, timestampRaw, source, sourceId, messageType, message: message.trim() };
            }
            return {
                timestamp: null, timestampRaw: null,
                source: "UNKNOWN", sourceId: "0",
                messageType: "OUT", message: line.trim()
            };
        });
    }
}

module.exports = Logs;