# A modified field says so in its name

- **Date:** 2026-11-20
- **Kind:** behavior, type, theme
- **Scope:** `standalone/UIKit` (`withMuiFieldState`, `DirtyMarker`,
  `labelWithDirtyMarker`): every control that shows the dirty marker, so every field of a
  Form with `showDirtyState` or a `DirtyStateProvider`, and everything an app marks with
  `labelWithDirtyMarker`

## What changed

Where a field shows the dirty marker, the dot after its label, the label now also ends in
a visually hidden "(modified)" in the user's language (translation key
`standalone.uikit.field-state.dirty`). It is part of the field's accessible name: a
screen reader reads "Due (modified)" where it read "Due". Nothing changes on screen.

- `withMuiFieldState` adds the text to the label of the component it wraps. It takes a
  second parameter, `labelProp`, naming the prop that holds that label: `"label"` (the
  default) for a text field or a date picker, `"children"` for a label component.
  `FormLabelCC` and the selectors' labels take it through their children.
- `DirtyMarker`, and so `labelWithDirtyMarker`, renders the text after the dot.
- New exports: `DirtyMarkerText`, the text itself, and `labelWithDirtyText(label, dirty)`,
  which appends it to a label rendered inside `FormControlCC` or `FormControlFieldsetCC`
  (a legend, a `FormControlLabel`), whose dot the wrapper draws but whose label it cannot
  reach. The library's checkbox, switch, radio group, checkbox group, select and
  signature renderers use it.
- `DirtyMarkerClassKey` gains `"text"`: the `CcDirtyMarker` theme component styles the
  text through `styleOverrides.text`.

## Why

The dot was the only sign that a field is modified, so a screen reader user could not
tell which fields hold changes (WCAG 1.3.1 Info and Relationships).

## Migration

- **Required for tests that find a marked field or tab by its exact name:** the name now
  ends in " (modified)". `getByRole("tab", { name: "Documents" })` no longer finds a
  marked "Documents" tab: use `{ name: "Documents (modified)" }`. The same goes for
  `getByLabelText` with the exact label text of a marked field.
- **Required for an app control that renders its own label inside `FormControlCC` or
  `FormControlFieldsetCC` and passes `dirty`** (a legend, a `FormControlLabel`): render
  the label as `labelWithDirtyText(label, dirty)`, or the dot has no text.
- To remove the text for the whole application, hide it through the theme:
  `CcDirtyMarker: { styleOverrides: { text: { display: "none" } } }`.
