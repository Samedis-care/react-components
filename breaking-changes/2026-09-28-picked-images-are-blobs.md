# Picked images stay files instead of becoming data URIs

- **Date:** 2026-09-28
- **Kind:** type, behavior
- **Scope:** `standalone/FileUpload` (`ImageSelector`, `FileUpload`, `MultiImage`, `ImageBox`, `File`), `backend-integration/Model/Types` (`TypeImage`, `TypeSignature`, `ModelDataTypeImageRenderer`, `ModelDataTypeSignatureRenderer`, `ModelDataTypeFilesRenderer`), `utils` (`processImage`)

## What changed

An image the user picks is kept as a `File` from the moment it is picked until it is
sent. Previously it was read into a base64 data URI right away, and that string was the
value.

- `ImageSelector`'s `value` is `string | Blob`. `onChange` hands over the processed
  image as a `File`, named after the picked file with the extension of its new type
  (`photo.heic` converted to JPEG becomes `photo.jpg`).
- `TypeImage` (`ModelDataTypeImages`) is a `Type<string | Blob>`. A
  `ModelDataTypeImageRenderer` field holds the server's URL (or `""`), or the picked
  `File`.
- Signatures stay PNG data URIs. `ModelDataTypeSignatureRenderer` now extends the new
  `ModelDataTypeSignature` (a `Type<string>`) and is no longer a `ModelDataTypeImages`.
  It never used the image params.
- `FileData.preview` is `string | Blob`. For a picked image it is the processed `File`,
  for a file from the server whatever URL the deserializer puts there.
- `MultiImageImage.image` is `string | Blob`, and `MultiImageProcessFile` resolves with a
  `File`.
- `ImageBox`'s `image` and `File`'s `preview` props take a `Blob` too.
- `processImage` resolves with a `File` for a `File` and with a `Blob` for a `Blob`,
  instead of a data URI. An SVG it leaves alone comes back as the same object. If the
  browser cannot encode the requested type it encodes PNG, and the result's `type` says so.

A Blob is shown through an object URL, which is revoked when the value changes or the
component unmounts. `useObjectUrl(value)` and `ObjectUrlImage` (an `<img>` whose `src`
may be a Blob) are exported for application code that shows these values.

## Why

A base64 string is a third larger than the file, and it was kept in form state, copied on
every change and serialized for every dirty check. It was then decoded again before being
uploaded. A `File` is a handle to data the browser already holds, so none of that work is
done.

## Migration

- Code that reads an image value as a string has to accept a `Blob`. For example, a
  connector that drops unchanged images with `!value.startsWith("data:")` now has to use
  `!(value instanceof Blob)`. `value.startsWith` throws on a Blob.
- Code that shows such a value in its own `<img>` uses `ObjectUrlImage` or `useObjectUrl`.
- Code that reaches signature fields through `ModelDataTypeImages` (an `instanceof` check,
  a prototype patch) uses `ModelDataTypeSignature` for them.
- Nothing changes on the wire: `RailsApiClient` uploads the `File` as a file part, as it
  did with the data URI. See [the API client entry](2026-09-28-api-clients-send-blobs.md).
