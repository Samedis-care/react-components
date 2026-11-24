# The import upload replaces its file with a new pick

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** CRUD import wizard (`backend-components/CRUD/Import`): Step1LoadData and `useImportStep1FileUploadProps`

## What changed

Step 1 (Upload data) holds one file. With a file listed, a new pick or drop now replaces
it:

- The Upload button opens the file picker. Before, it answered with "Maximum amount of
  allowed files reached", and a pick or drop was refused as "Invalid file selected — Too
  many files selected", so the file could only be changed by removing it first with the
  mouse.
- The replaced file and its rows leave the wizard's state at once (`state.files` and
  `state.data` are empty while the new file is read, so Next waits for its rows). The
  new file is listed meanwhile.
- A selection of several files at once is still refused, now with the dialog title "Only
  one file can be imported" (new key `backend-components.crud.import.errors.file_count`)
  above the upload's message "Too many files selected". Every other refusal keeps the
  title "Invalid file selected".

`useImportStep1FileUploadProps` implements this: the `files` it returns carry
`excludeFromLimits: true`, so the upload's `maxFiles` of 1 refuses only a selection of more
than one file, and its `onChange` keeps only the last file of the list it is given (a new
pick is listed after the file it replaces).

## Why

A user who picked the wrong file, or came Back from a failed review to load the corrected
one, could not pick another file, and a keyboard user could not remove the listed file at
all (WCAG 2.1.1).

## Migration

Nothing to do for an upload step that spreads `useImportStep1FileUploadProps`: it
replaces the file as well. Code that calls the hook's `onChange` itself gets only the last
file of the list kept.
