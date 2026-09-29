# The API clients send Blobs

- **Date:** 2026-09-28
- **Kind:** behavior, type
- **Scope:** `backend-integration/Connector` (`JsonApiClient`, `RailsApiClient`), `backend-integration/Model` (`Model.serialize`)

## What changed

- `RailsApiClient` sends a body with a `Blob` (a `File` included) as multipart, with the
  Blob as a file part. Previously only data URI strings did that, and a Blob was sent in
  JSON as `{}`. Data URIs still go out as file parts.
- A Blob that is not a `File` is named `blob` in the multipart body. Pass a `File` to
  name it. An array of Blobs goes as repeated file parts (`files[]`).
- A body Rails' multipart keys cannot express still goes as JSON, as before. That is one
  with an array of objects, like `nics: [{…}, {…}]`. `JsonApiClient` now puts every
  Blob in a JSON body as a data URI, and a `File` keeps its name as the `name` parameter
  (`data:image/png;name=photo.png;base64,…`).
- A value with `toJSON`, such as a `Date`, is sent in a multipart body as JSON would send
  it. Previously it was left out.
- `JsonApiClient.convertBody` is async. It returns `Promise<string | FormData | null>`.
- `Model.serialize` writes a Blob as data URI too, instead of `{}`.

Unchanged: null, undefined, empty arrays and empty objects leave their key out of a
multipart body, because multipart has no null.

## Why

The form engine now keeps picked files as Blobs (see [the entry on picked images](2026-09-28-picked-images-are-blobs.md)).
They have to reach the backend as files, without being read into base64 first.

## Migration

- A subclass that overrides `convertBody` returns a Promise.
- Nothing else to do. Code that built data URIs with `fileToData` only to hand them to the
  client can pass the `File` itself.

The clients also take `RequestOptions` (`signal`, `onUploadProgress`) as the last argument
of `request`, `get`, `post`, `put`, `patch` and `delete`. The hooks receive them as their
last argument. A response processor that retries by calling `this.request(…)` should pass
them on, or the retry has no signal and reports no progress.
