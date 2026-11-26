# The locale selector's picked row keeps its element, focus and tab stop while the language loads

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `non-standalone/LocaleSelector` (`LocaleSelectorDialog`'s rows)

## What changed

- The rows keep their elements: they are no longer created anew when a picked language
  starts or ends loading, when it fails to load, or when the language changes while the
  dialog is open. They only re-render.
- While a picked language loads, the picked row keeps keyboard focus, its focus ring and
  its tab stop, and keeps the look of an enabled row. It is marked
  `aria-disabled="true"` and ignores Enter, Space and clicks. The other rows are disabled
  as before: MUI's disabled look, `aria-disabled="true"`, `tabindex="-1"`.
- `components.CcLocaleSelectorEntry.defaultProps` takes `focusableWhenDisabled`
  (default `false`), which the list sets on the picked row.

## Why

Picking a row replaced every row with a new element, the focused one too, so screen
readers lost their place. The picked row then had MUI's disabled state: no focus ring
and no tab stop, so Tab from the search box skipped the list (WCAG 2.4.3, 2.4.7).

## Migration

Nothing to do, but expect the picked row in full color, with its focus ring when it
was picked with the keyboard, in screenshots of the loading dialog.
