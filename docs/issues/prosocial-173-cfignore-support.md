# Issue #173 — Respect .cfignore When Uploading an Application

- **Source:** [prosociallearnEU/cf-nodejs-client#173](https://github.com/prosociallearnEU/cf-nodejs-client/issues/173)
- **Status:** NOT RESOLVED
- **Priority:** Low
- **Created:** 2016-04-05

## Description
The CF CLI respects `.cfignore` to exclude files from upload. The library should do the same when packaging and uploading apps.

## Analysis
- `Apps.upload()` takes a pre-built zip `filePath` and uploads it directly.
- No built-in zip generation or file packaging logic exists in the library.
- No `.cfignore` parsing or filtering anywhere in the codebase.

## Resolution Plan
- Option A: Add a built-in zip generator that reads `.cfignore` and excludes matching files.
- Option B: Document that users must pre-package their zip excluding `.cfignore` patterns before calling `upload()`.
- Option B is simpler and more aligned with library scope.
