# TypeFiles serializes the file itself

- **Date:** 2026-09-28
- **Kind:** type, behavior
- **Scope:** `backend-integration/Model/Types` (`TypeFiles`, `ModelDataTypeFilesRenderer`)

## What changed

`TypeFiles.serialize` is synchronous. It puts the picked `File` into each entry's `data`,
and the processed image (a `File`) into `preview`, instead of data URIs.

The request carries the same content as before. The serialized value is an array of
objects, so `RailsApiClient` sends it as JSON, with each file as a data URI. The data URI
now also carries the file's name (`;name=…`).

## Why

Picked files stay files until they are sent (see [the entry on picked images](2026-09-28-picked-images-are-blobs.md)).
The API client decides how to send them.

## Migration

Code that calls `serialize` itself gets the value directly instead of a Promise, and finds
`File`s in `data` and `preview`. It can call `fileToData` on them where it needs data URIs.
