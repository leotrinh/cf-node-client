"use strict";

const CloudControllerBase = require("./CloudControllerBase");

/**
 * AppsCopy — copy and download operations for CF Applications.
 * Methods: copyBits, copyPackage, downloadBits, downloadDroplet
 *
 * @class
 */
class AppsCopy extends CloudControllerBase {

    constructor(endPoint, options = {}) {
        super(endPoint, options);
    }

    /**
     * Copy app bits from one app to another (v2 only).
     * @param {String} appGuid - Target app GUID
     * @param {String} sourceAppGuid - Source app GUID
     * @return {Promise}
     */
    copyBits(appGuid, sourceAppGuid) {
        if (this.isUsingV3()) {
            throw new Error("copyBits is only available in v2 API. Use copyPackage for v3.");
        }
        const token = this.getAuthorizationHeader();
        const options = {
            method: "POST",
            url: `${this.API_URL}/v2/apps/${appGuid}/copy_bits`,
            headers: { Authorization: token, "Content-Type": "application/json" },
            body: JSON.stringify({ source_app_guid: sourceAppGuid })
        };
        return this.REST.request(options, this.HttpStatus.CREATED, true);
    }

    /**
     * Copy a package from one app to another (v3 only).
     * @param {String} sourcePackageGuid
     * @param {String} targetAppGuid
     * @return {Promise}
     */
    copyPackage(sourcePackageGuid, targetAppGuid) {
        if (!this.isUsingV3()) {
            throw new Error("copyPackage is only available in v3 API. Use copyBits for v2.");
        }
        const token = this.getAuthorizationHeader();
        const data = { relationships: { app: { data: { guid: targetAppGuid } } } };
        return this.REST.requestV3(
            "POST",
            `${this.API_URL}/v3/packages?source_guid=${sourcePackageGuid}`,
            token, data, this.HttpStatus.CREATED
        );
    }

    /**
     * Download app bits (v2) or package bits (v3).
     * @param {String} guid - App GUID (v2) or Package GUID (v3)
     * @return {Promise} Binary buffer
     */
    downloadBits(guid) {
        const token = this.getAuthorizationHeader();
        const url = this.isUsingV3()
            ? `${this.API_URL}/v3/packages/${guid}/download`
            : `${this.API_URL}/v2/apps/${guid}/download`;
        const options = {
            method: "GET", url,
            headers: { Authorization: token },
            encoding: null
        };
        return this.REST.request(options, this.HttpStatus.OK, false);
    }

    /**
     * Download a droplet (v3 only).
     * @param {String} dropletGuid
     * @return {Promise} Binary buffer
     */
    downloadDroplet(dropletGuid) {
        if (!this.isUsingV3()) {
            throw new Error("downloadDroplet is only available in v3 API.");
        }
        const token = this.getAuthorizationHeader();
        const options = {
            method: "GET",
            url: `${this.API_URL}/v3/droplets/${dropletGuid}/download`,
            headers: { Authorization: token },
            encoding: null
        };
        return this.REST.request(options, this.HttpStatus.OK, false);
    }
}

module.exports = AppsCopy;
