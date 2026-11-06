# Connect data shows a failed script check on its field, and says each check's result

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** CRUD import wizard (`backend-components/CRUD/Import`): Step2ConnectData

## What changed

On step 2 of the unguided importer (Connect data), for each script card:

- A script that failed its check marks its field invalid (red outline and label,
  `aria-invalid="true"`), and the error is the field's helper text below it, the first part
  of the field's description. It was a plain text above the field.
- A visually hidden status message (`role="status"`) says the state of the check: "First
  Name: no script", "… checking the script", "… the script is valid" or "… the script is
  invalid". Screen readers announce it when it changes. The status icon's tooltip shows the
  same text; it showed the error, nothing, or "Unknown" before.
- The spinner of a running check is hidden from assistive technology, behind the status
  message.
- New keys `backend-components.crud.import.script_status.none`, `pending`, `okay` and
  `error` (with `{{FIELD}}`) in all 8 locales. The key
  `backend-components.crud.import.validations.unknown` is gone.

## Why

The result of a check was not exposed: the field stayed valid, the error was not its
description, the status icons had no text, and the spinner was a progressbar without a name.

## Migration

Nothing to do. SCF's import UI renders Step2ConnectData, so it gets the change too. An app
that used `validations.unknown` in its own code needs its own text.
