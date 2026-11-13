# DefaultFormPage applies textButtonSave and textButtonBack

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `backend-components/Form` (`DefaultFormPage`, `DefaultFormPageButtons`,
  `EditOnlyFormPage` through the theme)

## What changed

`textButtonSave` and `textButtonBack` of `DefaultFormPage` now label its Save and Back
buttons. Both buttons used to read the translated "Save" and "Back" whatever was passed.
The label is also the button's accessible name. Without the prop (or with `null`) the
buttons keep "Save" and "Back".

The same applies to `textButtonSave` / `textButtonBack` in
`components.CcDefaultFormPageButtons.defaultProps` of a theme: they now relabel the footer of
every `DefaultFormPage` and `EditOnlyFormPage` that does not set its own.

## Why

The props were documented and accepted but never read, so a page that asked for "Create" or
"Cancel" showed "Save" and "Back", on screen and to screen readers.

## Migration

Nothing to do for pages that want their labels: they now show them; expect them in
screenshots. A page that passes a label it does not want has to drop the prop.

In samedis.care, the "Create follow-up task" dialog (`MaintenanceNextEvent.tsx`) passes
`textButtonSave={t("next-event.dialog.save")}`, so its Save button now reads "Create".
