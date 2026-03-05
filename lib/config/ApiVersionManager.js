"use strict";

/**
 * Manages routing between Cloud Foundry API v2 and v3 endpoints
 * Handles endpoint mapping and URL construction based on API version
 */
class ApiVersionManager {
    constructor(apiVersion = "v3") {
        this.apiVersion = apiVersion;
        
        // Mapping of v2 endpoints to v3 equivalents
        this.endpointMap = {
            apps: { v2: "/v2/apps", v3: "/v3/apps" },
            organizations: { v2: "/v2/organizations", v3: "/v3/organizations" },
            spaces: { v2: "/v2/spaces", v3: "/v3/spaces" },
            services: { v2: "/v2/services", v3: "/v3/service_offerings" },
            serviceInstances: { v2: "/v2/service_instances", v3: "/v3/service_instances" },
            serviceBindings: { v2: "/v2/service_bindings", v3: "/v3/service_credential_bindings" },
            routes: { v2: "/v2/routes", v3: "/v3/routes" },
            domains: { v2: "/v2/domains", v3: "/v3/domains" },
            users: { v2: "/v2/users", v3: "/v3/users" },
            buildpacks: { v2: "/v2/buildpacks", v3: "/v3/buildpacks" },
            stacks: { v2: "/v2/stacks", v3: "/v3/stacks" },
            events: { v2: "/v2/events", v3: "/v3/audit_events" },
            jobs: { v2: "/v2/jobs", v3: "/v3/jobs" },
            organizationQuotas: { v2: "/v2/quota_definitions", v3: "/v3/organization_quotas" },
            spaceQuotas: { v2: "/v2/space_quota_definitions", v3: "/v3/space_quotas" },
            userProvidedServices: { v2: "/v2/user_provided_service_instances", v3: "/v3/service_instances" },
            tasks: { v2: null, v3: "/v3/tasks" }
        };
    }

    /**
     * Get endpoint path for a resource
     * @param {String} resourceName - Name of the resource (e.g., "apps")
     * @param {String} version - Optional: override current API version
     * @return {String} Endpoint path
     * @throws {Error} If resource not found in mapping
     */
    getEndpoint(resourceName, version = null) {
        const targetVersion = version || this.apiVersion;
        
        if (!this.endpointMap[resourceName]) {
            throw new Error(`Resource '${resourceName}' not found in endpoint mapping`);
        }

        const endpoint = this.endpointMap[resourceName][targetVersion];
        if (!endpoint) {
            throw new Error(`API version '${targetVersion}' not supported for resource '${resourceName}'`);
        }

        return endpoint;
    }

    /**
     * Build full URL for a resource
     * @param {String} baseUrl - Base API URL (e.g., https://api.cloudfoundry.com)
     * @param {String} resourceName - Name of the resource
     * @param {String} resourceId - Optional: specific resource ID
     * @param {String} version - Optional: override current API version
     * @return {String} Full URL
     */
    buildUrl(baseUrl, resourceName, resourceId = null, version = null) {
        const endpoint = this.getEndpoint(resourceName, version);
        let url = `${baseUrl}${endpoint}`;
        
        if (resourceId) {
            url = `${url}/${resourceId}`;
        }
        
        return url;
    }

    /**
     * Set API version
     * @param {String} version - API version (v2 or v3)
     * @throws {Error} If version is not v2 or v3
     */
    setVersion(version) {
        if (!["v2", "v3"].includes(version)) {
            throw new Error(`Invalid API version: ${version}. Supported versions: v2, v3`);
        }
        this.apiVersion = version;
    }

    /**
     * Get current API version
     * @return {String} Current API version
     */
    getVersion() {
        return this.apiVersion;
    }

    /**
     * Check if using v3
     * @return {Boolean}
     */
    isV3() {
        return this.apiVersion === "v3";
    }

    /**
     * Check if using v2
     * @return {Boolean}
     */
    isV2() {
        return this.apiVersion === "v2";
    }

    /**
     * Get all available resources
     * @return {Array} Array of resource names
     */
    getAvailableResources() {
        return Object.keys(this.endpointMap);
    }

    /**
     * Check if a resource supports a specific version
     * @param {String} resourceName - Name of the resource
     * @param {String} version - API version (v2 or v3)
     * @return {Boolean}
     */
    supportsVersion(resourceName, version = null) {
        const targetVersion = version || this.apiVersion;
        
        if (!this.endpointMap[resourceName]) {
            return false;
        }
        
        return !!this.endpointMap[resourceName][targetVersion];
    }

    /**
     * Get field name mapping between v2 and v3 for a resource
     * Returns the v3 equivalent of a v2 field name
     * @param {String} resourceName - Name of the resource
     * @param {String} fieldName - Field name in v2
     * @return {String} Equivalent field name in v3 or same if unchanged
     */
    getV3FieldName(resourceName, fieldName) {
        const fieldMappings = {
            apps: {
                state: "lifecycle.type",
                space_guid: "relationships.space.data.guid",
                buildpack: "lifecycle.data.buildpacks",
                memory: "memory_in_mb",
                disk_quota: "disk_in_mb"
            },
            services: {
                service_broker_guid: "relationships.service_broker.data.guid"
            },
            organizations: {
                // Most fields are the same
            },
            spaces: {
                organization_guid: "relationships.organization.data.guid"
            },
            routes: {
                space_guid: "relationships.space.data.guid",
                domain_guid: "relationships.domain.data.guid"
            }
        };

        if (fieldMappings[resourceName] && fieldMappings[resourceName][fieldName]) {
            return fieldMappings[resourceName][fieldName];
        }

        return fieldName;
    }

    /**
     * Check if resource needs special handling for v3
     * @param {String} resourceName - Name of the resource
     * @return {Boolean}
     */
    needsV3SpecialHandling(resourceName) {
        // These resources have significant structural changes in v3
        const resourcesNeedingSpecialHandling = [
            "apps",
            "services",
            "serviceBindings",
            "events"
        ];

        return resourcesNeedingSpecialHandling.includes(resourceName);
    }
}

module.exports = ApiVersionManager;
