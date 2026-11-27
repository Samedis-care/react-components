# A touch row header in MatrixGrid says what it opens and everything it shows

- **Date:** 2026-11-27
- **Kind:** behavior
- **Scope:** `standalone/Matrix` (`MatrixGrid`)

## What changed

On a touch-only device with `onRowHeaderActions` set, a row header is one button. It keeps
its name, the row's `label` ("Eva Sommer"), and now has an accessible description: "Opens
the actions for this row." in the current language (new translation key
`standalone.matrix.row-header-actions`), followed by everything `renderRowHeader` renders.
A header showing a name and a "guest" tag is announced as "Eva Sommer, button, Opens the
actions for this row. Eva Sommer guest". Without a `label`, the button is still named by
what the header renders, and the sentence alone is its description.

What `renderRowHeader` returns is now rendered inside an element with `display: contents`,
on every device, so that the description can point at it. It draws no box, so the layout
is unchanged, but a style that targets the header's direct children
(`.CcMatrixGrid-rowHeader > *`) now reaches that element instead of the rendered contents.

## Why

The `label` replaced the header's contents as the button's name, so anything else the
header shows (a tag, a status) never reached a screen reader, and nothing said that the
button opens the row's actions (WCAG 2.4.6, 4.1.2). The name stays the `label`: it is also
the name of the row's header cell, which a screen reader repeats for every cell of the row.

## Migration

Nothing required. Give every row a `label` if not done yet: without one, the button is
named by everything the header renders, an avatar's initial included. Tests find the
button by its name as before, or by its description:
`getByRole("button", { name: "Eva Sommer", description: /^Opens the actions/ })`.
