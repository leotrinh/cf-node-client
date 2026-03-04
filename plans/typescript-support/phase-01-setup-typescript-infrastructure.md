# Phase 1: TypeScript Infrastructure Setup

**Duration**: 1-2 hours | **Priority**: CRITICAL | **Status**: REQUIRED

## Context

This phase establishes the TypeScript compiler infrastructure without modifying JavaScript source code. The hybrid approach uses TypeScript's `allowJs` and `noEmit` options to check types on existing JavaScript files.

## Objectives

1. ✅ Install TypeScript and @types/node as devDependencies
2. ✅ Create tsconfig.json with appropriate hybrid settings
3. ✅ Verify TypeScript compiler integration
4. ✅ Test compilation without errors

## Implementation Steps

### Step 1.1: Add TypeScript Dependencies

**File**: `package.json`

Add to `devDependencies`:

```json
{
  "typescript": "^5.3.0",
  "@types/node": "^20.0.0"
}
```

**Command**:
```bash
npm install --save-dev typescript@^5.3.0 @types/node@^20.0.0
```

**Success Criteria**:
- ✅ `node_modules/typescript` directory created
- ✅ `package-lock.json` updated
- ✅ `npx tsc --version` shows installed version

---

### Step 1.2: Create tsconfig.json

**File**: `tsconfig.json` (NEW - root of project)

**Settings Rationale**:
- `allowJs: true` - Accept .js files
- `checkJs: true` - Type-check JavaScript
- `noEmit: true` - Don't generate .js files (keep existing source)
- `target: ES2020` - Modern ECMAScript target
- `module: commonjs` - Node.js module format
- `strict: true` - Enable all strict type checks
- `esModuleInterop: true` - Better CommonJS compatibility

**Content**:

```jsonc
{
  "compilerOptions": {
    // Core settings
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    
    // Type checking
    "strict": true,
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    
    // Module resolution
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    
    // Emit options
    "declaration": false,
    "declarationMap": false,
    "sourceMap": false
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

**Success Criteria**:
- ✅ File created at project root
- ✅ `npx tsc --noEmit` runs without errors
- ✅ JSON format is valid

---

### Step 1.3: Create types/ Directory Structure

**Directory**: `types/`  
**File**: `types/index.d.ts` (MAIN ENTRY POINT)

Create empty placeholder first:

```typescript
// TypeScript type definitions for cf-node-client
// This file serves as the entry point for all type definitions

export {};
```

**Success Criteria**:
- ✅ Directory `types/` created
- ✅ File `types/index.d.ts` created
- ✅ File is valid TypeScript (no syntax errors)

---

### Step 1.4: Update package.json

**File**: `package.json`

Add the "types" field pointing to the type definitions:

```json
{
  "name": "cf-node-client",
  "version": "1.0.0",
  "main": "index.js",
  "types": "types/index.d.ts",
  ...
}
```

Also update the `files` array to include types/:

```json
{
  "files": [
    "index.js",
    "lib",
    "types"
  ]
}
```

**Success Criteria**:
- ✅ "types" field added  
- ✅ Value points to `types/index.d.ts`
- ✅ types/ included in files array
- ✅ `npm run build` executes without errors

---

### Step 1.5: Add TypeScript Build Script

**File**: `package.json`

Update `scripts` section:

```json
{
  "scripts": {
    "build": "tsc --noEmit",
    "build:check": "tsc --noEmit --pretty false",
    "type-check": "tsc --noEmit",
    ...
  }
}
```

**Command**:
```bash
npm run build
```

**Success Criteria**:
- ✅ Script executes successfully
- ✅ No TypeScript errors reported

---

### Step 1.6: Verify Initial Setup

**Commands**:

```bash
# Check TypeScript compiler works
npx tsc --version

# Type-check without emitting files
npm run type-check

# Verify files compile
npx tsc --noEmit

# List type definitions accessible
npm list typescript
```

**Expected Output**:
```
Version 5.3.0 (or installed version)
(no errors)
(no errors)
typescript@5.3.0
@types/node@20.0.0
```

## Checklist

- [ ] TypeScript installed via npm
- [ ] @types/node installed via npm  
- [ ] tsconfig.json created at project root
- [ ] tsconfig.json has correct hybrid settings
- [ ] types/index.d.ts created (placeholder)
- [ ] package.json updated with "types" field
- [ ] types/ added to package.json files array
- [ ] npm run build script added
- [ ] Build script executes without errors
- [ ] Project compiles with `npx tsc --noEmit`

## Notes

- Keep JavaScript source unchanged - this is a non-breaking change
- `noEmit: true` critical to avoid generating unwanted .js files
- TypeScript compiler will check .js files but not modify them
- The hybrid approach maintains 100% backward compatibility

## Next Phase

Proceed to [Phase 2: Create Type Declarations](./phase-02-create-type-declarations.md)

---

*Est. Completion Time*: 1-2 hours  
*Files Modified*: package.json, tsconfig.json (new)  
*Files Created*: types/index.d.ts
