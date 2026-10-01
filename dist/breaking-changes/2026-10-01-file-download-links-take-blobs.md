# File download links take Blobs

- **Date:** 2026-10-01
- **Kind:** type
- **Scope:** `standalone/FileUpload` (`FileMeta`, `File`, new `ObjectUrlLink`), `backend-integration/Model/Types/Renderers` (`RendererFiles`)

## What changed

- `FileMeta.downloadLink` and `File`'s `downloadLink` prop are `string | Blob`. A file
  with a Blob link opens through an object URL, which is revoked once the link changes or
  the file unmounts.
- `File`'s `onClick` receives that object URL as `url`.
- `RendererFiles` lists a file with a Blob link as a link too. It uses the new
  `ObjectUrlLink`, an `<a>` whose `href` may be a Blob, exported next to `ObjectUrlImage`.

## Why

Picked files stay files until they are sent (see [the entry on picked images](2026-09-28-picked-images-are-blobs.md)).
A file that is only held locally, such as an upload a `CrudFileUpload` with a `LazyConnector`
has queued, can now be opened like one from the server.

## Migration

- Code that reads `downloadLink` as a string has to accept a `Blob`. To show or link it,
  use `useObjectUrl`, `ObjectUrlLink` or `ObjectUrlImage`.
- A `CrudFileUpload` deserializer can pass the serialized `File` on as `downloadLink`, so
  a queued upload can be opened before it is sent.
