# The delete confirmation counts with plural forms

- **Date:** 2026-11-26
- **Kind:** behavior, i18n
- **Scope:** `backend-components/DataGrid` (`BackendDataGrid` and `CRUD` with
  `enableDelete`, `useBackendDataGridDeleteHandler`); the
  `backend-components.data-grid.delete.*` translation keys

## What changed

- The built-in delete confirmation uses the grammatical form the number needs, with the
  number where the language puts it: "Do you really want to delete 1 entry?" instead of
  "… 1 entries?", "Wirklich 3 Einträge löschen?" instead of "Wirklich 3-Einträge löschen?",
  "Souhaitez-vous vraiment supprimer 3 entrées ?" instead of "… les entrées 3 ?",
  "Вы действительно хотите удалить 5 записей?" instead of "… записи 5?". The same goes for
  the confirmation after select all ("… everything except 1 entry?", "… alles außer
  3 Einträgen …").
- The translation keys `backend-components.data-grid.delete.confirm-dialog.message` and
  `.messageInverted` are replaced by plural keys, `message_one` / `message_other` and
  `messageInverted_one` / `messageInverted_other` (plus `_few` / `_many` where a language
  has them), in every locale. They take the number as `{{count}}` instead of `{{NUM}}`.
- Fixed texts: French Yes reads "Oui" (was "Qui"), the Dutch error title "Fout" (was
  "Error"), the Uzbek OK button "OK" (was "xop"), and the French error message starts with
  "Échec".

## Why

The confirmation got the number as `NUM`, so i18next could not pick a plural form: every
language showed its plural for one entry, and Russian, which needs three forms after a
number, showed none of them right. Some translations put the number after the noun.

## Migration

Nothing to do; expect the new texts in screenshots. An app that overrides
`backend-components.data-grid.delete.confirm-dialog.message` or `.messageInverted` in the
components-care i18n instance: rename the overrides to the plural keys above and use
`{{count}}`, or they no longer have an effect.
