# Issue #183 — Not Getting Detailed Information of the Log

- **Source:** [prosociallearnEU/cf-nodejs-client#183](https://github.com/prosociallearnEU/cf-nodejs-client/issues/183)
- **Status:** NOT RESOLVED
- **Priority:** Medium
- **Created:** 2016-06-10

## Description
Log output does not include timestamps or detailed metadata.

## Analysis
- `Logs.js` has only `getRecent(appGuid)` which returns raw response without parsing.
- No timestamp extraction, no protobuf decoding, no log message formatting.
- CF logging API returns protobuf-encoded envelopes with timestamp data.

## Resolution Plan
- Parse log responses to extract timestamps, source_type, message_type.
- Consider using the v3 audit events API as an alternative.
- Return structured log entries: `{ timestamp, source, message, level }`.
