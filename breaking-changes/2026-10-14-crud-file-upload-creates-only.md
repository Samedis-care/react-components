# CrudFileUpload only creates files, and serialize takes no id

- **Date:** 2026-10-14
- **Kind:** behavior, type
- **Scope:** `backend-components/FileUpload`

## What changed

`CrudFileUpload` sends every picked file to `connector.create`. With `allowDuplicates`
on, a file with the name of a listed one used to go to `connector.update` and overwrite
that record. It is now created as a record of its own, and both stay listed, as the prop
says.

`CrudFileUploadProps.serialize` loses its second parameter, which was the id of the
record to overwrite:

```ts
serialize: (data: FileData<File>) => Promise<Record<string, unknown>> | Record<string, unknown>;
```

## Why

With `allowDuplicates` on, the control lists both files. After the update, both list
entries pointed at the same record. Removing either one deleted that record, and the other
entry kept showing a file that was no longer on the server. Without `allowDuplicates`, a
replaced file is now removed and its replacement created
(see [Replacing a file by name removes the old one like the remove button](2026-10-14-file-upload-replacing-removes-old-file.md)),
so no write needs an id.

## Migration

Drop the `id` parameter from serializers passed to `CrudFileUpload`, along with any field
filled from it. A serializer that still declares `id` as a required parameter no longer
type-checks. Code that relied on `allowDuplicates` to overwrite a file in place has to
leave `allowDuplicates` off, so the old file is deleted and the new one created.
