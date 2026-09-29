# postEditCallback takes and returns a Blob

- **Date:** 2026-09-28
- **Kind:** type
- **Scope:** `standalone/FileUpload/Image` (`ImageSelector`, `PostImageEditCallback`), `backend-integration/Model/Types` (`TypeImageParams.postEditCallback`)

## What changed

`PostImageEditCallback` is `(image: File) => Promise<Blob>`, instead of a data URI in and
a data URI out. It receives the file the user picked and resolves with the edited image.
The image is converted and down-scaled after the edit, as before. An edited `Blob` that
is not a `File` gets the picked file's name, with the extension of the edited image's type.

## Why

Picked images stay files (see [the entry on picked images](2026-09-28-picked-images-are-blobs.md)),
so a data URI contract would read each image into base64 just for the edit.

## Migration

An editor that draws on a canvas loads the file through an object URL instead of the data
URI, and resolves with `canvas.toBlob` instead of `canvas.toDataURL`:

```ts
const postImageEdit: PostImageEditCallback = async (file) => {
	const url = URL.createObjectURL(file);
	try {
		const canvas = await openEditor(url); // the application's editor
		return await new Promise<Blob>((resolve, reject) =>
			canvas.toBlob(
				(blob) => (blob ? resolve(blob) : reject(new Error("encode failed"))),
				"image/png",
			),
		);
	} finally {
		URL.revokeObjectURL(url);
	}
};
```

`processImageB64` still exists for code that has to work on data URIs.
