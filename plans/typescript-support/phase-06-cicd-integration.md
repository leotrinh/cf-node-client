# Phase 6: CI/CD Integration

**Duration**: 30-45 minutes | **Priority**: MEDIUM | **Status**: AUTOMATION

## Context

Integrate TypeScript type-checking and validation into the existing CI/CD pipeline to ensure types remain valid with each commit and release.

## Objectives

1. ✅ Add type-check step to GitHub Actions (if using)
2. ✅ Update pre-commit hooks
3. ✅ Add type-check to publish workflow
4. ✅ Document CI/CD changes

## Implementation Steps

### Step 6.1: Update package.json npm Scripts

**File**: `package.json`

Update scripts to include comprehensive checks:

```json
{
  "scripts": {
    "lint": "npm run lint:js && npm run lint:ts",
    "lint:js": "eslint ./lib/*.js ./lib/**/*.js ./test/*.js ./test/**/*.js",
    "lint:ts": "tsc --noEmit",
    "lint:fix": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "build": "tsc --noEmit",
    "build:check": "tsc --noEmit --pretty false",
    "test": "npm run lint && npm run test_local",
    "test:types": "tsc --noEmit && npm run validate:types",
    "validate:types": "node test/typescript-declaration-validation.js",
    "validate:package": "node test/validate-package-structure.js",
    "preversion": "npm run lint && npm run test:types && npm test",
    "prepublishOnly": "npm run lint && npm run test:types && npm test",
    "ci": "npm run lint && npm run test:types && npm test"
  ]
}
```

**Key Changes**:
- `lint` now includes TypeScript checking
- `test:types` aggregates all type validations
- `preversion` and `prepublishOnly` require types to pass
- `ci` script for CI/CD pipelines

---

### Step 6.2: Create GitHub Actions Workflow

**File**: `.github/workflows/typescript-check.yml` (NEW)

```yaml
name: TypeScript Type Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  type-check:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run TypeScript compiler check
        run: npm run build
      
      - name: Validate type declarations
        run: npm run validate:types
      
      - name: Validate package structure
        run: npm run validate:package
      
      - name: Run linter with type checking
        run: npm run lint:ts
      
      - name: Run full test suite
        run: npm test
```

---

### Step 6.3: Update Main CI/CD Workflow

**File**: `.github/workflows/ci.yml` (if exists, or create new)

Add TypeScript checks to existing CI workflow:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type-check
        run: npm run type-check
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Validate TypeScript declarations
        run: npm run validate:types
      
      - name: Validate package structure
        run: npm run validate:package
```

---

### Step 6.4: Create Pre-Commit Hook

**File**: `.husky/pre-commit` (if using Husky)

Create or update pre-commit hook:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Lint staged files
npx lint-staged

# Type check
npm run type-check

# Validate declarations
npm run validate:types
```

**Install Husky if not already installed**:
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run type-check && npm run validate:types"
```

---

### Step 6.5: Create Pre-Push Hook

**File**: `.husky/pre-push` (if using Husky)

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run full test suite before push
npm run test:types
npm test
```

**Add hook**:
```bash
npx husky add .husky/pre-push "npm run test:types && npm test"
```

---

### Step 6.6: Update Release Workflow

**File**: `.github/workflows/release.yml` (NEW)

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type-check
        run: npm run type-check
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Validate type declarations
        run: npm run validate:types
      
      - name: Validate package structure
        run: npm run validate:package
      
      - name: Build and publish
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
```

---

### Step 6.7: Document Build & Test Process

**File**: `docs/CI-CD-Setup.md` (NEW)

```markdown
# CI/CD Setup Guide

## Overview

The TypeScript support is integrated into the CI/CD pipeline to ensure:
- Type safety on every push
- Declarations remain valid
- No breaking changes
- Package structure is correct

## Local Development

### Type Checking

Before committing, run type checks:

```bash
npm run type-check
npm run validate:types
npm run validate:package
```

### Full Test Suite

```bash
npm run test:all
```

### Pre-commit Hooks

If using Husky, hooks automatically run:

```bash
git commit ...  # Triggers pre-commit hook
git push        # Triggers pre-push hook
```

## GitHub Actions Workflows

### Continuous Integration

**Trigger**: On push/PR to main or develop

**Steps**:
1. Install dependencies
2. Run TypeScript type check
3. Run ESLint
4. Run unit tests
5. Validate type declarations
6. Validate package structure

**File**: `.github/workflows/ci.yml`

### TypeScript-Specific Check

**Trigger**: On push/PR to main or develop

**Steps**:
1. Test on Node 18.x, 20.x, 22.x
2. Run TypeScript compiler
3. Validate declarations
4. Validate package structure
5. Run full test suite

**File**: `.github/workflows/typescript-check.yml`

### Release Workflow

**Trigger**: On tag push (v*)

**Steps**:
1. Run all validation
2. Run full test suite
3. Publish to npm
4. Create GitHub release

**File**: `.github/workflows/release.yml`

## Checking Build Status

- Check GitHub Actions tab in repository
- Or run locally: `npm run ci`

## Troubleshooting

### Type errors after changes

```bash
npm run type-check
# Shows specific type errors
```

### Declaration validation fails

```bash
npm run validate:types
# Shows which exports are missing
```

### Package structure issues

```bash
npm run validate:package
# Shows what's wrong with package.json
```

## When Publishing

1. Ensure all GitHub Actions pass
2. Update version in package.json
3. Create git tag: `git tag v1.0.0`
4. Push tags: `git push --tags`
4. GitHub Actions will automatically publish to npm
```

---

### Step 6.8: Add TypeScript Status Badge

**File**: `README.md`

Add TypeScript support badge:

```markdown
# cf-node-client

[![npm version](https://badge.fury.io/js/cf-node-client.svg)](https://badge.fury.io/js/cf-node-client)
[![GitHub Actions](https://github.com/leotrinh/cf-node-client/workflows/CI/badge.svg)](https://github.com/leotrinh/cf-node-client/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-yellow.svg)](https://opensource.org/licenses/Apache-2.0)
```

---

### Step 6.9: Update CHANGELOG

**File**: `CHANGELOG.md`

Add entry for TypeScript support:

```markdown
## [2.0.0] - 2024-03-04

### Added
- **TypeScript Support**: Full TypeScript type definitions (types/index.d.ts)
  - Hybrid approach: JavaScript source with TypeScript declarations
  - No breaking changes to existing JavaScript API
  - Complete IDE IntelliSense support
  - Comprehensive type definitions for all Cloud Controller models
  - Type-safe API consumers
- New `npm run build` script for type checking
- New `npm run type-check` script for validation
- TypeScript examples in examples/ directory
- TypeScript API reference documentation
- Integrated type checking into CI/CD pipeline

### Changed
- package.json: Added "types" field pointing to types/index.d.ts
- package.json: Updated scripts to include type checking
- Lint script now includes TypeScript validation

### Technical Details
- TypeScript 5.3+
- Target: ES2020, Module: commonjs
- Strict mode enabled
- No runtime overhead (noEmit: true)
```

---

### Step 6.10: Verify CI Configuration

**Steps**:

1. Push changes to GitHub
2. Check "Actions" tab in repository
3. Verify workflows run and pass:
   - CI workflow runs
   - TypeScript check workflow runs
   - All steps succeed

4. Go to release tag after publishing:
   - Release workflow ran successfully
   - npm package includes types/

**Success Indicators**:
- Green checkmarks on all workflows
- No failed job steps
- npm package published successfully

---

## Checklist

- [ ] package.json scripts updated with type checking
- [ ] GitHub Actions CI workflow created/updated
- [ ] TypeScript-specific check workflow created
- [ ] Release workflow includes validation
- [ ] Pre-commit hooks configured (if using Husky)
- [ ] Pre-push hooks configured (if using Husky)
- [ ] Build status badge added to README
- [ ] CHANGELOG updated with TypeScript support
- [ ] CI/CD documentation created
- [ ] Local test command documented
- [ ] Workflows tested with a test commit/push

## CI/CD Verification Checklist

After merging to main:

- [ ] All GitHub Actions pass
- [ ] TypeScript check workflow succeeds
- [ ] npm package includes types/index.d.ts
- [ ] npm types registry updated (automatic)
- [ ] types are discoverable in IDE

## Next Phase

Proceed to [Phase 7: Release & Documentation](./phase-07-release-and-documentation.md)

---

*Est. Completion Time*: 30-45 minutes  
*Files Created*: 3-4 workflow files + documentation  
*CI/CD Coverage*: Build, Test, Type Check, Release
