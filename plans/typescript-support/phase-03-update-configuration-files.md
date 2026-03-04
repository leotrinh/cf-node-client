# Phase 3: Update Configuration Files

**Duration**: 30-45 minutes | **Priority**: HIGH | **Status**: CONFIGURATION

## Context

Ensure all configuration files properly include TypeScript definitions and that the package is correctly configured for TypeScript consumers.

## Objectives

1. ✅ Update package.json to declare types
2. ✅ Update .npmignore to include types/
3. ✅ Add TypeScript type-checking to lint scripts
4. ✅ Configure .gitignore for TypeScript artifacts

## Implementation Steps

### Step 3.1: Update package.json - Types Field

**File**: `package.json`

Add/update the `types` field:

```json
{
  "name": "cf-node-client",
  "version": "1.0.0",
  "description": "A Cloud Foundry Client for Node.js",
  "main": "index.js",
  "types": "types/index.d.ts",
  "author": "Leo Trinh <tinhtd.info@gmail.com>",
  "license": "Apache-2.0",
  ...
}
```

**Location**: Top-level properties, after "main"

**Why**: NPM uses this field to locate type definitions for your package. TypeScript consumers will automatically pick up these types.

---

### Step 3.2: Update package.json - Files Array

**File**: `package.json`

Add `types/` to the files array:

```json
{
  "files": [
    "index.js",
    "lib",
    "types",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ]
}
```

**Why**: Controls what gets published to npm. Including `types/` ensures type definitions are shipped with the package.

---

### Step 3.3: Update .npmignore

**File**: `.npmignore` (create if doesn't exist)

Ensure types/ is NOT ignored:

```
# Files to exclude from npm package
.git
.gitignore
.github
node_modules
test
examples
docs
plans
obsolete
*.md
!README.md
!CHANGELOG.md
!LICENSE
.eslintrc*
.eslintignore
.travis.yml
Gruntfile.js
tsconfig.json
jest.config.js
*.test.js

# Include types directory
!types
!types/**/*.d.ts
```

**Key Points**:
- Remove any rule that excludes `types/`
- Add `!types` to force inclusion
- Add `!types/**/*.d.ts` to ensure declarations are included

---

### Step 3.4: Update lint Script

**File**: `package.json`

Update the lint script to include TypeScript type-checking:

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
    ...
  }
}
```

**Explanation**:
- `lint` now runs both JS linting and TypeScript type checking
- `type-check` and `build` are aliases for TypeScript compilation
- Can still run `npm run lint:js` for JS-only linting if needed

---

### Step 3.5: Update .gitignore

**File**: `.gitignore`

Add TypeScript-related patterns:

```
# Build outputs (TypeScript, JavaScript transpilers)
dist/
build/
*.js.map
*.d.ts.map

# IDE
.vscode/
.idea/
*.swp
*.swo

# Dependencies
node_modules/

# Generated files
coverage/

# OS
.DS_Store
Thumbs.db

# Testing
.mocha-env

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local
```

**Why**: 
- Prevents accidental commits of build artifacts
- `.d.ts.map` files should not be committed if generated
- IDEs and OS files are already handled

---

### Step 3.6: Create TypeScript Configuration for IDE

**File**: `tsconfig.json` (already created in Phase 1, verify these settings)

Verify these settings are present:

```jsonc
{
  "compilerOptions": {
    // Include TypeScript in the types array for global types
    "types": ["node"]
  },
  "include": [
    "index.js",
    "lib/**/*.js",
    "types/**/*.d.ts"
  ],
  "exclude": [
    "node_modules",
    "test",
    "examples",
    "obsolete",
    "plans",
    "docs"
  ]
}
```

---

### Step 3.7: Update VS Code Settings (Optional)

**File**: `.vscode/settings.json` (create if doesn't exist)

Add TypeScript-specific settings:

```json
{
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.fixAll.eslint": true
    }
  },
  "search.exclude": {
    "node_modules": true,
    "coverage": true
  }
}
```

---

### Step 3.8: Verify Configuration

**Command**:

```bash
# Verify package.json is valid
npm run build

# Check that types are recognized
npx tsc --listFiles | grep types

# Verify files will be published
npm pack --dry-run
```

**Expected Output**:
```
(no errors)
(types/index.d.ts listed)
(includes types/ directory)
```

---

### Step 3.9: Validate package.json Structure

**Command**:
```bash
# Check that package.json references types correctly
npm ls types 2>/dev/null || echo "Package structure verified"

# Simulate what npm will publish
npm pack --dry-run | grep -E "(types/|package.json|index.js)"
```

**Expected Output**:
```
npm notice 📦  cf-node-client@1.0.0
...
npm notice === Tarball Contents ===
npm notice 640B  package.json
npm notice 151B  index.js
npm notice 45.2kB lib/
npm notice 2.3kB  types/index.d.ts
...
```

## Checklist

- [ ] "types" field added to package.json
- [ ] types/ included in "files" array
- [ ] .npmignore updated to include types/
- [ ] lint script includes TypeScript checking
- [ ] type-check script added
- [ ] build script verifies TypeScript
- [ ] .gitignore includes TypeScript patterns
- [ ] .vscode/settings.json configured (optional)
- [ ] npm run build succeeds
- [ ] npm pack shows types/ included
- [ ] Package structure verified valid

## Configuration Summary

| File | Change | Reason |
|------|--------|--------|
| package.json | Add "types" field | NPM/TypeScript discovery |
| package.json | Add types/ to files | Include in npm package |
| .npmignore | Include types/ | Don't exclude from npm |
| package.json | Update lint script | Add type checking |
| tsconfig.json | Verify settings | IDE support |
| .gitignore | Add TS patterns | Don't commit artifacts |

## Files Modified

- package.json (add types field, update scripts, update files array)
- .npmignore (ensure types/ included)
- .gitignore (add TypeScript patterns)
- tsconfig.json (verify configuration)

## Next Phase

Proceed to [Phase 4: TypeScript Examples & Documentation](./phase-04-typescript-examples-and-docs.md)

---

*Est. Completion Time*: 30-45 minutes  
*Complexity*: LOW  
*Risk*: MINIMAL (configuration only, no code changes)
