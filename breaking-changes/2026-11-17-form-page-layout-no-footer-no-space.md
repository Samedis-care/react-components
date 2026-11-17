# A form page without buttons ends where its body ends

- **Date:** 2026-11-17
- **Kind:** behavior
- **Scope:** `standalone/Form` (FormPageLayout), and so every form page that uses the
  library layout (BasicFormPage, DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage)

## What changed

`FormPageLayout`:

- With `footer` `null`, `undefined` or `false` it renders no footer element (the
  `footer` slot, `classes.footer`) and keeps no space for one: the layout ends where the
  body ends, without the 66px below it. BasicFormPage passes `footer={null}` while a
  nested form page is open in its body, so a form page that holds a nested one now ends
  like any other page: at the end of the inner form, the inner page's Save rests 36px
  above the bottom of what scrolls, with no blank space below it.
- A footer that renders nothing, such as the FormButtons of a read-only page without a
  way back (an EditOnlyFormPage without `goBack`), is hidden while it is empty
  (`:empty`) and takes no space either.
- `footer` is optional in `FormPageLayoutProps`.

## Why

Without buttons the layout still rendered an empty footer with its 66px top margin, so a
page without buttons ended in blank space, and a form page that holds a nested form page
added that space below the inner page: the inner page's Save rested 66px above the
bottom of the scroll area instead of 36px, over blank space.

## Migration

- Nothing to do for form pages that use the library layout.
- Theme overrides: `CcFormPageLayout.styleOverrides.footer` no longer applies on a page
  without buttons, as there is no footer element (or it is hidden). Space a theme wants
  below such a page goes on the `body` or `root` slot.
- Replacement layouts set through `CcBasicFormPage.defaultProps.formPageLayoutComponent`
  (SCF's `SamedisFormPageLayout`, IMF's `ImFormPageLayout`) are not affected.
