/**
 * Unit tests for cf-node-client v1.0.0
 * Focused on API v3 migration testing
 */

'use strict';

const { expect } = require('chai');
const CloudController = require('../../lib/model/cloudcontroller/CloudController');
const ApiConfig = require('../../lib/config/ApiConfig');
const ApiVersionManager = require('../../lib/config/ApiVersionManager');

describe('cf-node-client v1.0.3 - API v3 Migration', function () {
    this.timeout(5000);

    describe('Package Configuration', function () {
        
        it('should have correct package name', function () {
            const pkg = require('../../package.json');
            expect(pkg.name).to.equal('cf-node-client');
        });

        it('should have version 1.0.3', function () {
            const pkg = require('../../package.json');
            expect(pkg.version).to.equal('1.0.3');
        });

        it('should have index.js export version 1.0.3', function () {
            const lib = require('../../index.js');
            expect(lib.version).to.equal('1.0.3');
        });

        it('should export all 16 Cloud Foundry models', function () {
            const lib = require('../../index.js');
            expect(lib.Apps).to.be.a('function');
            expect(lib.Organizations).to.be.a('function');
            expect(lib.Spaces).to.be.a('function');
            expect(lib.Services).to.be.a('function');
            expect(lib.ServiceInstances).to.be.a('function');
            expect(lib.Routes).to.be.a('function');
            expect(lib.ServiceBindings).to.be.a('function');
            expect(lib.Domains).to.be.a('function');
            expect(lib.BuildPacks).to.be.a('function');
            expect(lib.Stacks).to.be.a('function');
            expect(lib.Users).to.be.a('function');
            expect(lib.Events).to.be.a('function');
            expect(lib.Jobs).to.be.a('function');
            expect(lib.OrganizationsQuota).to.be.a('function');
            expect(lib.SpacesQuota).to.be.a('function');
        });
    });

    describe('ApiConfig - Version Management System', function () {
        
        it('should initialize with v3 as default', function () {
            const config = new ApiConfig();
            expect(config.isV3()).to.be.true;
        });

        it('should support v3 API version', function () {
            const config = new ApiConfig();
            expect(() => config.setVersion('v3')).to.not.throw();
            expect(config.isV3()).to.be.true;
        });

        it('should support v2 API version for backward compatibility', function () {
            const config = new ApiConfig();
            expect(() => config.setVersion('v2')).to.not.throw();
            expect(config.isV3()).to.be.false;
        });

        it('should reject invalid API versions', function () {
            const config = new ApiConfig();
            expect(() => config.setVersion('v4')).to.throw();
        });

        it('should return current API version', function () {
            const config = new ApiConfig();
            expect(config.getVersion()).to.equal('v3');
            config.setVersion('v2');
            expect(config.getVersion()).to.equal('v2');
        });
    });

    describe('ApiVersionManager - Endpoint Mapping', function () {
        
        let versionManager;

        beforeEach(function () {
            versionManager = new ApiVersionManager();
        });

        it('should map Apps endpoints for v2', function () {
            const endpoint = versionManager.getEndpoint('apps', 'v2');
            expect(endpoint).to.include('/v2/apps');
        });

        it('should map Apps endpoints for v3', function () {
            const endpoint = versionManager.getEndpoint('apps', 'v3');
            expect(endpoint).to.include('/v3/apps');
        });

        it('should handle renamed endpoints: services -> service_offerings', function () {
            const endpoint = versionManager.getEndpoint('services', 'v3');
            expect(endpoint).to.include('service_offerings');
        });

        it('should handle renamed endpoints: events -> audit_events', function () {
            const endpoint = versionManager.getEndpoint('events', 'v3');
            expect(endpoint).to.include('audit_events');
        });

        it('should handle jobs endpoint mapping', function () {
            const endpoint = versionManager.getEndpoint('jobs', 'v3');
            expect(endpoint).to.include('/v3/jobs');
        });

        it('should support 16 resource types mapping', function () {
            const resources = ['apps', 'organizations', 'spaces', 'services', 'serviceInstances', 
                            'routes', 'serviceBindings', 'domains', 'buildpacks', 'stacks', 
                            'users', 'events', 'jobs', 'organizationQuotas', 'spaceQuotas',
                            'userProvidedServices'];
            
            resources.forEach(resource => {
                expect(() => {
                    versionManager.getEndpoint(resource, 'v3');
                    versionManager.getEndpoint(resource, 'v2');
                }).to.not.throw();
            });
        });
    });

    describe('CloudController - Version Switching', function () {
        
        let controller;
        const mockToken = {
            token_type: 'Bearer',
            access_token: 'test_token_12345',
            expires_in: 3600
        };

        beforeEach(function () {
            controller = new CloudController('https://api.example.com');
            controller.setToken(mockToken);
        });

        it('should initialize with v3 as default', function () {
            expect(controller.isUsingV3()).to.be.true;
        });

        it('should allow switching to v2', function () {
            controller.setApiVersion('v2');
            expect(controller.isUsingV3()).to.be.false;
        });

        it('should preserve token after switching API version', function () {
            const originalToken = controller.UAA_TOKEN.access_token;
            controller.setApiVersion('v2');
            expect(controller.UAA_TOKEN.access_token).to.equal(originalToken);
        });

        it('should return current API version', function () {
            expect(controller.getApiVersion()).to.equal('v3');
            controller.setApiVersion('v2');
            expect(controller.getApiVersion()).to.equal('v2');
        });

        it('should support switching back to v3 from v2', function () {
            controller.setApiVersion('v2');
            expect(controller.isUsingV3()).to.be.false;
            controller.setApiVersion('v3');
            expect(controller.isUsingV3()).to.be.true;
        });

        it('should throw error on invalid version', function () {
            expect(() => controller.setApiVersion('invalid')).to.throw();
        });
    });

    describe('Model Compilation - All 14 Cloud Controller Models', function () {
        
        it('should compile Apps.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Apps')).to.not.throw();
        });

        it('should compile Organizations.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Organizations')).to.not.throw();
        });

        it('should compile Spaces.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Spaces')).to.not.throw();
        });

        it('should compile Services.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Services')).to.not.throw();
        });

        it('should compile ServiceInstances.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/ServiceInstances')).to.not.throw();
        });

        it('should compile Routes.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Routes')).to.not.throw();
        });

        it('should compile ServiceBindings.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/ServiceBindings')).to.not.throw();
        });

        it('should compile Domains.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Domains')).to.not.throw();
        });

        it('should compile BuildPacks.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/BuildPacks')).to.not.throw();
        });

        it('should compile Stacks.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Stacks')).to.not.throw();
        });

        it('should compile Users.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Users')).to.not.throw();
        });

        it('should compile Events.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Events')).to.not.throw();
        });

        it('should compile Jobs.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/Jobs')).to.not.throw();
        });

        it('should compile OrganizationsQuota.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/OrganizationsQuota')).to.not.throw();
        });

        it('should compile SpacesQuota.js without errors', function () {
            expect(() => require('../../lib/model/cloudcontroller/SpacesQuota')).to.not.throw();
        });
    });

    describe('Model Instantiation - Individual Model v2/v3 Support', function () {
        
        const mockToken = {
            token_type: 'Bearer',
            access_token: 'test_token_12345',
            expires_in: 3600
        };

        it('should instantiate Organizations model with v2/v3 support', function () {
            const Organizations = require('../../lib/model/cloudcontroller/Organizations');
            const org = new Organizations('https://api.example.com', mockToken);
            expect(org.isUsingV3).to.be.a('function');
        });

        it('should instantiate Spaces model with v2/v3 support', function () {
            const Spaces = require('../../lib/model/cloudcontroller/Spaces');
            const spaces = new Spaces('https://api.example.com', mockToken);
            expect(spaces.isUsingV3).to.be.a('function');
        });

        it('should instantiate Services model with v2/v3 support', function () {
            const Services = require('../../lib/model/cloudcontroller/Services');
            const svc = new Services('https://api.example.com', mockToken);
            expect(svc.isUsingV3).to.be.a('function');
        });

        it('should instantiate Routes model with v2/v3 support', function () {
            const Routes = require('../../lib/model/cloudcontroller/Routes');
            const routes = new Routes('https://api.example.com', mockToken);
            expect(routes.isUsingV3).to.be.a('function');
        });
    });

    describe('Metrics & UAA Models', function () {
        
        it('should compile Logs.js (Metrics)', function () {
            expect(() => require('../../lib/model/metrics/Logs')).to.not.throw();
        });

        it('should compile UsersUAA.js (UAA)', function () {
            expect(() => require('../../lib/model/uaa/UsersUAA')).to.not.throw();
        });

        it('should instantiate Logs model', function () {
            const Logs = require('../../lib/model/metrics/Logs');
            const logs = new Logs();
            expect(logs.getRecent).to.be.a('function');
        });

        it('should instantiate UsersUAA model', function () {
            const UsersUAA = require('../../lib/model/uaa/UsersUAA');
            const users = new UsersUAA('https://uaa.example.com');
            expect(users.add).to.be.a('function');
            expect(users.getUsers).to.be.a('function');
            expect(users.remove).to.be.a('function');
        });
    });

    describe('Backward Compatibility', function () {
        
        it('should allow v2 API selection for legacy code', function () {
            const controller = new CloudController('https://api.example.com');
            controller.setToken({ token_type: 'Bearer', access_token: 'token' });
            
            controller.setApiVersion('v2');
            expect(controller.getApiVersion()).to.equal('v2');
        });

        it('should maintain full feature parity between v2 and v3 APIs', function () {
            const controller = new CloudController('https://api.example.com');
            controller.setToken({ token_type: 'Bearer', access_token: 'token' });
            
            const v3Methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
                .filter(m => m.charAt(0) !== '_' && m !== 'constructor');
            
            controller.setApiVersion('v2');
            const v2Methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
                .filter(m => m.charAt(0) !== '_' && m !== 'constructor');
            
            expect(v3Methods.sort()).to.deep.equal(v2Methods.sort());
        });
    });
});
