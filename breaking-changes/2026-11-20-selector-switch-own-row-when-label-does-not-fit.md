# A selector's switch takes the label's row alone when the label does not fit beside it

- **Date:** 2026-11-20
- **Kind:** behavior
- **Scope:** `standalone/Selector` (`BaseSelector` and every selector built on it: `SingleSelect`, `MultiSelect`, `BackendSingleSelect`, `BackendMultiSelect`, `BackendMultipleSelect`, the model renderers' selects)

## What changed

- A selector with `displaySwitch` (or a backend selector with `switchFilterName`) still shows its switch at the right end of the field label's row. When the field label does not fit beside the switch, the switch now keeps that row to itself and the field label starts on the row below it, directly above the field, with the whole width it has in a selector without a switch. Before, the field label stayed on the switch's row and was cut with an ellipsis to the room left of the switch.
- Such a selector is one label row taller than before. Where the label fits beside the switch (e.g. "Device type" and "Show inactive" in a 400px field) it looks as before.
- The field label of every selector (with or without a switch) is now as wide as its text, up to the width of the field, like MUI's own shrunk labels. Before, its box always spanned the row. The text shows as before; only the empty part right of the text no longer focuses the field on a click.

## Why

At 320px with 16px gutters, "Verantwortliche Person" next to "Inaktive Einträge anzeigen" showed as "Verantw…", although the label fits the field on its own, and nothing showed the rest (WCAG 1.4.10 Reflow).

## Migration

Nothing to do. Expect selectors with a switch on phones and in narrow columns to be one row taller in screenshots, with the switch above the field label. Neither app sets `displaySwitch` or `switchFilterName` today.
