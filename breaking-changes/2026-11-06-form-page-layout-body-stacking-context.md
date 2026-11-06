# FormPageLayout's body is its own stacking context

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/Form`

## What changed

The `body` slot of `FormPageLayout`, and so of every form page that uses it (BasicFormPage,
DefaultFormPage, EditOnlyFormPage, FlowEngineFormPage), sets `isolation: isolate`. A z-index
inside the body now only orders the body's own content:

- The floating footer (Save, Back) paints above everything in the body that scrolls under it
  and gets every click in its area: outlined and filled field labels, badges, the DataGrid's
  settings and filter panels, and any other content with a z-index of its own.
- Content in the body can no longer be raised above anything outside the body with a
  z-index: not above the footer, the busy overlay (`other`), or positioned parts of the page
  that come after the form. Popups rendered through a portal (menus, selects, pickers,
  tooltips, dialogs) are not affected.

The layout itself is unchanged: absolutely positioned and fixed content in the body is
placed as before.

## Why

The footer floats over the bottom of the body without a z-index of its own, so content of
the body with a z-index was drawn over the buttons and took their clicks. With an outlined
field scrolled under Save, a click on Save focused the field instead of saving.

## Migration

Nothing to do for content that opens its popups through a portal (the MUI and library
default). Content in a form page's body that has to appear above the footer or outside the
body has to render through a portal.
