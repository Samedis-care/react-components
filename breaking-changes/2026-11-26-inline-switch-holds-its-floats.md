# An InlineSwitch is as high as its switch row and its children

- **Date:** 2026-11-26
- **Kind:** behavior
- **Scope:** `standalone/InlineSwitch`, and so `standalone/MultiSelectWithoutGroup`
  (its chips), `standalone/MultiSelectWithTags` and
  `backend-components/BackendMultiSelectWithTags`, which show their chips through it

## What changed

An InlineSwitch's root holds its floated switch row and its floated children: it is as
high as both together, and what follows it starts below them.

- A shown switch without children takes the height of its row; text after the
  InlineSwitch no longer flows to the left of the switch.
- Floated children, such as MultiSelectWithoutGroup's chips, end inside the root. What
  follows the chips (a helper or error text, the next field) starts below the last chip
  instead of beside or under them, and MultiSelectWithTags' loading overlay, which
  covers its root, covers the chips too.

Inside the root nothing moves: the switch still floats at the top right of the
children, their text flows to its left, and a selector's field label shares the
switch's row when it fits beside it.

The top margin of the first child no longer passes through the root: such a child
starts that far below the root's top, while the switch row stays at the top.

## Why

The root was 0px high when its content was floated, so the switch and the chips hung
out of it, and where they landed depended on what came after the InlineSwitch.

## Migration

Nothing changes for an InlineSwitch whose switch is hidden (`visible={false}`) around
content that is not floated, which is how every selector without a switch renders it.
Expect content after a MultiSelectWithoutGroup or MultiSelectWithTags with selected
entries to start below the chips.

A child with a border or a background of its own starts at the switch's top, so the
switch sits on its frame. Required for any app that shows an InlineSwitch's switch
(`visible`) around such a child: give the child `clear: "both"`, so it starts below the
switch row.

```tsx
<InlineSwitch
	visible
	value={showAll}
	onChange={setShowAll}
	label={t("show-all")}
>
	<Paper variant="outlined" sx={{ clear: "both" }}>
		{content}
	</Paper>
</InlineSwitch>
```
