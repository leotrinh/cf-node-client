"use strict";

const CloudControllerBase = require("../cloudcontroller/CloudControllerBase");

/**
 * UsersUAA — User management and authentication for Cloud Foundry UAA.
 * Supports password, client_credentials, passcode, and authorization_code grant types.
 * Extends CloudControllerBase for shared HttpUtils / HttpStatus / token management.
 *
 * @class
 */
class UsersUAA extends CloudControllerBase {

    /**
     * @param {String} [endPoint] - UAA endpoint URL
     */
    constructor(endPoint) {
        super(endPoint);
    }

    /**
     * Add a User on UAA (SCIM)
     * @param {Object} uaaOptions - User creation options
     * @return {Promise}
     */
    add(uaaOptions) {
        const options = {
            method: "POST",
            url: `${this.API_URL}/Users`,
            headers: {
                Accept: "application/json",
                Authorization: this.getAuthorizationHeader()
            },
            json: uaaOptions
        };
        return this.REST.request(options, this.HttpStatus.CREATED, false);
    }

    /**
     * Update user password
     * @param {String} uaaGuid - User GUID
     * @param {Object} uaaOptions - Password update options
     * @return {Promise}
     */
    updatePassword(uaaGuid, uaaOptions) {
        const options = {
            method: "PUT",
            url: `${this.API_URL}/Users/${uaaGuid}/password`,
            headers: {
                Accept: "application/json",
                Authorization: this.getAuthorizationHeader()
            },
            json: uaaOptions
        };
        return this.REST.request(options, this.HttpStatus.OK, false);
    }

    /**
     * Remove a User
     * @param {String} uaaGuid - User GUID
     * @return {Promise}
     */
    remove(uaaGuid) {
        const options = {
            method: "DELETE",
            url: `${this.API_URL}/Users/${uaaGuid}`,
            headers: {
                Accept: "application/json",
                Authorization: this.getAuthorizationHeader()
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, false);
    }

    /**
     * Get users (SCIM)
     * @param {String} [searchOptions] - Query string (e.g. '?filter=userName eq "demo4"')
     * @return {Promise}
     */
    getUsers(searchOptions) {
        let url = `${this.API_URL}/Users`;
        if (searchOptions) url += searchOptions;
        const options = {
            method: "GET",
            url: url,
            headers: {
                Accept: "application/json",
                Authorization: this.getAuthorizationHeader()
            }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Authenticate with password grant type
     * @param {String} username
     * @param {String} password
     * @return {Promise} UAA token response
     */
    login(username, password) {
        const options = {
            method: "POST",
            url: `${this.API_URL}/oauth/token`,
            headers: {
                Authorization: "Basic Y2Y6",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: { grant_type: "password", client_id: "cf", username, password }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Refresh an OAuth token
     * @return {Promise} UAA token response
     */
    refreshToken() {
        const options = {
            method: "POST",
            url: `${this.API_URL}/oauth/token`,
            headers: {
                Accept: "application/json",
                Authorization: "Basic Y2Y6",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: { grant_type: "refresh_token", refresh_token: this.UAA_TOKEN.refresh_token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Authenticate using client_credentials grant type (service-to-service).
     * @param {String} clientId
     * @param {String} clientSecret
     * @return {Promise}
     */
    loginWithClientCredentials(clientId, clientSecret) {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const options = {
            method: "POST",
            url: `${this.API_URL}/oauth/token`,
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            form: { grant_type: "client_credentials" }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Authenticate using an API key (Bearer token).
     * For SAP BTP and other platforms that support API key authentication.
     * @param {String} apiKey - The API key/token for authentication
     * @return {Promise} Resolves with the authenticated token
     */
    loginWithApiKey(apiKey) {
        if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
            return Promise.reject(new Error("API key is required and must be a non-empty string"));
        }
        // For API key auth, we directly use the key as a Bearer token
        // SAP BTP and other platforms provide pre-authenticated tokens
        return Promise.resolve({
            token_type: "bearer",
            access_token: apiKey.trim(),
            expires_in: 43199, // Default expiry (12 hours)
            scope: "uaa.resource",
            jti: `api-key-${Date.now()}`
        });
    }

    /**
     * Authenticate using a one-time passcode (SSO).
     * @param {String} passcode
     * @return {Promise}
     */
    loginWithPasscode(passcode) {
        const options = {
            method: "POST",
            url: `${this.API_URL}/oauth/token`,
            headers: {
                Authorization: "Basic Y2Y6",
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            form: { grant_type: "password", passcode }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Exchange an authorization code for a token (OAuth2 code flow).
     * @param {String} code
     * @param {String} clientId
     * @param {String} clientSecret
     * @param {String} redirectUri
     * @return {Promise}
     */
    loginWithAuthorizationCode(code, clientId, clientSecret, redirectUri) {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const options = {
            method: "POST",
            url: `${this.API_URL}/oauth/token`,
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            form: { grant_type: "authorization_code", code, redirect_uri: redirectUri }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Get token information from UAA /check_token endpoint.
     * @param {String} token - Access token to check
     * @param {String} clientId
     * @param {String} clientSecret
     * @return {Promise}
     */
    getTokenInfo(token, clientId, clientSecret) {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
        const options = {
            method: "POST",
            url: `${this.API_URL}/check_token`,
            headers: {
                Authorization: `Basic ${credentials}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            form: { token }
        };
        return this.REST.request(options, this.HttpStatus.OK, true);
    }

    /**
     * Decode a JWT token locally (no server validation, no signature verification).
     * @param {String} token - JWT access token
     * @return {Object} Decoded payload
     * @throws {Error} If token is invalid
     */
    decodeToken(token) {
        if (!token || typeof token !== "string") {
            throw new Error("Token must be a non-empty string.");
        }
        const parts = token.split(".");
        if (parts.length !== 3) {
            throw new Error("Invalid JWT format. Expected 3 dot-separated parts.");
        }
        try {
            const payload = Buffer.from(parts[1], "base64").toString("utf8");
            return JSON.parse(payload);
        } catch (e) {
            throw new Error(`Failed to decode JWT payload: ${e.message}`);
        }
    }
}

module.exports = UsersUAA;
