# A form page scrolls a focused field clear of its footer, and the footer stops floating on short screens

- **Date:** 2026-11-13
- **Kind:** behavior
- **Scope:** `standalone/Form` (FormPageLayout), and so every form page that uses the
  library layout (BasicFormPage, DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage)

## What changed

`FormPageLayout`:

- When an element in the body gets the focus while the floating footer (Save, Back)
  covers it, or while it lies below the footer's top edge within the footer's width, the
  layout scrolls whatever scrolls the form (a FormDialog's content, a scrolling panel or
  main area, or the document) up in the next frame, until the element ends 30px above the
  footer, but no further than its top stays in view. Tabbing through a long form no
  longer leaves the focused field behind the Save bar. Focus inside a portal that the
  body's content renders (a Select's menu, a popover) does not scroll the form.
- On a screen at most 480px tall (a phone held sideways, a page zoomed to 300% or 400%)
  the footer no longer floats: it is `position: static`, in flow after the body, 30px
  below the body's content and 36px above the end of the layout. On a long form Save is
  at the end of the form. Where the footer rests is the same as on a taller screen: at
  the end of a long form, and at the bottom of a short form that fills its parent.

## Why

The browser scrolls a newly focused element into view only when it lies outside the
visible area, and the floating footer is inside that area, so a field behind the Save bar
got the focus without being shown (WCAG 2.4.11 Focus Not Obscured). On a short screen the
floating footer covered more than half of what was visible: below a 56px app header at
400% zoom, 120px of a 200px main area, which left too little room to see a focused field
or a text area whole.

## Migration

- Nothing to do for form pages that use the library layout.
- Theme overrides: `CcFormPageLayout.styleOverrides.footer` that set `position` or
  `margin` win over the short-screen layout too, so the footer floats there again; put
  them inside `"@media (min-height: 481px)"` to keep it.
- Replacement layouts set through `CcBasicFormPage.defaultProps.formPageLayoutComponent`
  (SCF's `SamedisFormPageLayout`) are not affected.
