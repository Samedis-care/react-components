# Each script field in Connect data is named after its field, and enum cards list their values

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** CRUD import wizard (`backend-components/CRUD/Import`): Step2ConnectData

## What changed

On step 2 of the unguided importer (Connect data):

- Each script field's label names the field it converts: "First Name: Conversion Script
  (JavaScript)" instead of "Conversion Script (JavaScript)" on every card. A field without a
  label is named by its key. The key `backend-components.crud.import.conv_script` takes the
  field as `{{FIELD}}` now, in all 8 locales.
- The card of an enum field (single or multi) shows the values a script has to return, under
  its type: `"eng" (Engineering), "ops" (Operations)`, each value as a string literal with
  its label when that differs. Dividers and invisible values are left out.
- The script field's description is the card's type line, and for an enum also its values.

## Why

Every script field had the same name, so a screen-reader user could not tell which field a
script was for, or which type it has to return, without leaving the field. The values an
enum script has to return were not shown anywhere.

## Migration

Nothing to do. SCF's import UI renders Step2ConnectData, so it gets the new labels and enum
values too. An app that overrides `conv_script` in its own translations needs to add
`{{FIELD}}`.
