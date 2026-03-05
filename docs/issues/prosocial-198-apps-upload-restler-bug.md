# Issue #198 — Apps.upload() ERR_INVALID_ARG_TYPE

- **Source:** [prosociallearnEU/cf-nodejs-client#198](https://github.com/prosociallearnEU/cf-nodejs-client/issues/198)
- **Status:** NOT RESOLVED
- **Priority:** Critical
- **Created:** 2022-05-11

## Description
`Apps.upload()` fails with `ERR_INVALID_ARG_TYPE: The "buffer" argument must be an instance of Buffer` on newer Node.js versions. Root cause is the unmaintained `restler` package (v3.4.0).

## Analysis
- `HttpUtils.js` `upload()` still uses `rest.put()` from `restler`.
- `Apps.js` `_uploadV2()` and `_uploadV3()` use `rest.file()`.
- Code has TODO: `//TODO: Analyze a way to remove this dependency`.
- `restler` is unmaintained since 2015 and incompatible with Node.js 12+.

## Resolution Plan
- Replace `restler` with `form-data` + native `http`/`https` or `axios` for multipart upload.
- Update `HttpUtils.js` upload method.
- Test with Node.js 18+ and 20+.

## Related
- IBM-Cloud#50 (Node security alerts — restler is flagged).
