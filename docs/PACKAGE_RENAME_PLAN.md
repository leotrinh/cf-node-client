# Package Rename Plan: cf-nodejs-client → cf-node-client

## Overview
Rename the package from `cf-nodejs-client` to `cf-node-client` as the old package has stopped maintenance. This change will be part of the v1.0.0 release alongside the Cloud Foundry API v3 migration (Phases 1-3 completed).

**Status:** Planning Phase
**Priority:** High (blocks v1.0.0 release)
**Effort:** ~2 hours
**Timeline:** Phase 8 (Post-Phase 7, before final release)

---

## Rationale
- Original package `cf-nodejs-client` is no longer actively maintained
- New package name `cf-node-client` is shorter, cleaner, and follows npm naming conventions
- This change should coincide with major version bump to v1.0.0 (due to API v3 migration)
- Allows clear break from legacy package, encouraging users to migrate

---

## Files Affected

### 1. **package.json** (HIGH PRIORITY)
- [x] Update: `name` field from `"cf-nodejs-client"` → `"cf-node-client"`
- [x] Update: `version` field to `"1.0.0"` (major release)
- [x] Update: `homepage` URL (if GitHub URL contains old package name)
- [x] Update: `repository.url` (if applicable)
- [x] Impact: Npm registry publishes under new name

### 2. **README.md** (HIGH PRIORITY)
- [x] Update: NPM install command from `npm install cf-nodejs-client --save` → `npm install cf-node-client --save`
- [x] Update: All references to "cf-nodejs-client" → "cf-node-client"
- [x] Update: Header and title references
- [x] Add: Migration notice for users of old package
- [x] Add: Installation instructions pointing to new package name
- [x] Impact: Users see correct installation instructions

### 3. **CHANGELOG.md** (HIGH PRIORITY)
- [x] Add: v1.0.0 release entry documenting major changes
- [x] Include: Package rename from cf-nodejs-client → cf-node-client
- [x] Include: API v3 migration summary
- [x] Include: Breaking changes notice
- [x] Include: Migration guide reference

### 4. **docs/** (MEDIUM PRIORITY)
- [x] Update: All markdown files that reference old package name
  - Index files for documentation
  - Migration guides
  - Getting started guides
- [x] Action: Global search/replace for consistency
- [x] Impact: Documentation reflects new package name

### 5. **index.js** (NO CHANGES)
- [x] No changes needed - only reference is in require() calls by users
- [x] Internal exports remain same

### 6. **lib/** files (NO CHANGES)
- [x] No internal code changes required
- [x] Package rename is external only

### 7. **NPM Registry** (MANUAL STEP POST-RELEASE)
- [ ] Publish new package `cf-node-client@1.0.0` to npm registry
- [ ] Consider: Deprecate old `cf-nodejs-client` package with redirect notice
- [ ] Manual step after code release is ready
- [ ] Update: npm registry metadata with migration notice

---

## Implementation Steps

### Step 1: Update package.json
```json
{
  "name": "cf-node-client",           // Changed
  "version": "1.0.0",                 // Major version bump
  "description": "A Cloud Foundry Client for Node.js",
  "author": "Juan Antonio Breña Moral <bren@juanantonio.info>",
  "license": "Apache-2.0",
  ...
}
```

### Step 2: Update README.md
- Replace all instances of `cf-nodejs-client` with `cf-node-client`
- Update npm install example:
  ```bash
  npm install cf-node-client --save
  ```
- Add migration section for old package users
- Update API documentation links if they reference package name

### Step 3: Update CHANGELOG.md
- Add version 1.0.0 entry with:
  - Package name change: cf-nodejs-client → cf-node-client
  - API v3 migration (Phases 1-3 summary)
  - Breaking changes: List of v3 API changes
  - Migration guide: Link to docs/MIGRATION_GUIDE.md
- Reference deprecation of old package

### Step 4: Update Documentation Files
- Global search for "cf-nodejs-client" references
- Replace with "cf-node-client" in:
  - Docs header files
  - Installation/getting-started guides
  - Any reference documentation

### Step 5: Update imports/references
- Search for any hardcoded package name references in:
  - JSDoc comments
  - Error messages
  - Documentation examples

---

## Success Criteria
- [ ] package.json name changed to `cf-node-client`
- [ ] package.json version bumped to `1.0.0`
- [ ] README.md installation instructions updated
- [ ] CHANGELOG.md documents the change
- [ ] All documentation files reference new package name
- [ ] No broken references to old package name
- [ ] Compilation check passes: `node -c lib/**/*.js`
- [ ] Git diff shows only intended changes

---

## Integration with v3 Migration
This phase executes AFTER Phase 7 (Release Preparation):

**Timeline:**
- Phases 1-3: ✅ Complete (28 methods in Apps.js, v3 support foundation)
- Phase 4: Update 14 remaining models (pending user approval)
- Phase 5: Update Metrics & UAA models
- Phase 6: Write comprehensive tests
- Phase 7: Release preparation & docs update
- **Phase 8: Package rename** ← YOU ARE HERE
- NPM Registry: Publish cf-node-client@1.0.0 (manual)

**Release Notes for v1.0.0:**
- Cloud Foundry API v3 support (default)
- Cloud Foundry API v2 support (fallback for backward compatibility)
- Package renamed: cf-nodejs-client → cf-node-client
- All 17 models support dual v2/v3 API endpoints
- Comprehensive test coverage
- TypeScript definitions included

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Users miss migration notice | High | Confusion | Add prominent notice in README, CHANGELOG, and docs |
| Old package installs still referenced | Medium | User confusion | Publish deprecation notice on npm to old package |
| GitHub searches find old package name | Low | Configuration issues | Update all references, use new repo URL |
| Backward compatibility breaks | Low | Breaking change | Document all breaking changes in CHANGELOG |

---

## Verification Checklist
```
Package Rename Verification:
- [ ] grep -r "cf-nodejs-client" --exclude-dir=.git (should return 0 matches)
- [ ] grep -r "cf-node-client" found in: package.json, README.md, CHANGELOG.md
- [ ] npm test passes with new package name
- [ ] node -c lint on all files passes
- [ ] Documentation builds successfully
- [ ] CHANGELOG.md has v1.0.0 entry with migration notes
- [ ] README.md shows correct npm install command
```

---

## Next Steps After Phase 8

### After Package Rename Complete:
1. **Final Testing:** Run full test suite with new package name
2. **Git Tag:** Create git tag `v1.0.0` for release
3. **NPM Publish:** Publish to npm registry as `cf-node-client@1.0.0`
4. **Deprecation Notice:** Add deprecation notice to old `cf-nodejs-client` package on npm
5. **GitHub Release:** Create GitHub release with comprehensive release notes
6. **Announcement:** Document the migration path for existing users

---

## Reference Documents
- [IMPLEMENTATION_PLAN_FINAL.md](./IMPLEMENTATION_PLAN_FINAL.md) - Main implementation plan
- [v3-migration-progress.md](./v3-migration-progress.md) - v3 migration progress
- [CHANGELOG.md](../CHANGELOG.md) - Change log (will be updated)
- [README.md](../README.md) - Main readme (will be updated)
