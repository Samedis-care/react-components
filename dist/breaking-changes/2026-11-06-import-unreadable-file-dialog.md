# The import upload names a file it cannot read, and drops it

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** CRUD import wizard (`backend-components/CRUD/Import`): Step1LoadData and `useImportStep1FileUploadProps`

## What changed

When the picked file cannot be read as an Excel workbook (damaged, password-protected, or
another format renamed to .xlsx), step 1 now:

- shows an info dialog titled "Invalid file selected" (as for a refused file) with the
  message "*name* cannot be read. Save it as an Excel workbook (.xlsx) without a password and
  pick it again." (new key `backend-components.crud.import.errors.file_read`, with
  `{{FILE_NAME}}`),
- removes the file from the upload and clears the rows read before.

Before, the file stayed in the upload, Next stayed disabled without a message, and the
failed read was an unhandled promise rejection.

## Why

The user had no way to tell why the wizard did not go on.

## Migration

Nothing to do. SCF's own upload step spreads `useImportStep1FileUploadProps`, so it shows the
dialog as well.
