# MultiSelectWithoutGroup's switch has a row of its own above the chips

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/MultiSelectWithoutGroup` with `displaySwitch`

## What changed

The switch of a MultiSelectWithoutGroup (`displaySwitch`, `switchLabel`) has a row of its
own between the search field and the chips: the switch at the right end of the row, its
label before it, the chips below the row. Before, the switch and its label (after the
switch) floated at the top right of the chips, and the first chips sat beside them.

A label too long for the row beside the switch moves to the next line, below the switch,
and wraps. The label's text reads in the direction of its own words, so punctuation at its
end stays there.

## Why

MultiSelectWithoutGroup's style for this row is now applied: it targets the switch row by
its class `CcInlineSwitch-switchWrapper`, which InlineSwitch did not set before (see
[InlineSwitch's slots have static `CcInlineSwitch-*` classes](2026-11-25-inline-switch-static-slot-classes.md)).
The chips get the field's full width, and the switch no longer pushes them around.

## Migration

Nothing required. Expect the new row in screenshots of a MultiSelectWithoutGroup with a
switch. A theme that wants the switch beside the chips, with its label after it, overrides
the row:

```ts
createTheme({
	components: {
		CcMultiSelectWithoutGroup: {
			styleOverrides: {
				switch: {
					"& .CcInlineSwitch-switchWrapper": {
						width: "auto",
						direction: "inherit",
					},
				},
			},
		},
	},
});
```
