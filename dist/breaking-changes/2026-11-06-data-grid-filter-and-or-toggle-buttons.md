# The column filter's AND/OR choice is a pair of toggle buttons

- **Date:** 2026-11-06
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (column filter popup)

## What changed

Between two conditions of a column filter, the popup shows two toggle buttons side by side,
"AND | OR", over the popup's full width, in place of the switch with "AND" on its left and
"OR" on its right. It is MUI's exclusive `ToggleButtonGroup` (`size="small"`), about as tall
as the switch was. The pressed button is the current combination, and a new filter starts
with "AND" pressed, as the switch started off.

- A click on a word picks that word. A click on the word that is already picked changes
  nothing; one of the two always stays pressed.
- The buttons form one group named "Combine conditions" (new translation key
  `standalone.data-grid.content.filter-combination.label`, in every locale), and the pressed
  one has `aria-pressed="true"`. The group is one Tab stop: the arrow keys move the focus
  between the words, and Space or Enter picks the focused one.
- The group is the theme slot `CcDataGrid.filterCombinator` and takes the new
  `classes.filterCombinator`.

The filter values are unchanged: `nextFilterType` is still `"and"` or `"or"`.

## Why

The switch and both words shared one label. A click on "AND" while AND was chosen switched
to OR, and screen readers announced the control as "AND OR, switch, off", where "off" meant
AND.

## Migration

Nothing to do in the apps. Tests or scripts that drive the column filter through
`role="switch"` press the button by name instead
(`getByRole("button", { name: "OR" })`, pressed when `aria-pressed` is `"true"`). Theme
overrides of the switch inside the popup no longer apply; style
`CcDataGrid.filterCombinator` instead. The group uses MUI's default `standard` colour; a
theme that wants the pressed word in its primary colour sets `color: "primary"` in
`defaultProps` of `MuiToggleButtonGroup`, or styles `CcDataGrid.filterCombinator`.
