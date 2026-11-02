# CrudFileUpload's `additionalFiles` no longer count toward its limits

- **Date:** 2026-11-02
- **Kind:** behavior
- **Scope:** `backend-components/FileUpload`, `standalone/FileUpload`

## What changed

`maxFiles` and `maxTotalFileSize` of `CrudFileUpload` limit only the control's own files.
The `additionalFiles` are still listed, but no longer counted.

`FileData` has a new flag for this, `excludeFromLimits`: a file that has it is listed by
`FileUpload` but left out of `maxFiles` and `maxTotalFileSize`. `CrudFileUpload` sets it on
its additional files.

## Why

The additional files are someone else's files, listed read-only next to the field's own.
Counting them meant that `maxFiles={1}` with one additional file refused every upload with
"Too many files selected", although the field had no file of its own.

## Migration

None needed, unless a call site raised `maxFiles` or `maxTotalFileSize` by what its
additional files take up, to make room for them: take that back out.
