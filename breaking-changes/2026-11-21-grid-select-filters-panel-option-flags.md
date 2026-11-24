# The filter panel's GridSingleSelectFilter and GridMultiSelectFilter honor hidden, isDisabled and `[text, node]` labels

- **Date:** 2026-11-21
- **Kind:** behavior
- **Scope:** `standalone/DataGrid` (`GridSingleSelectFilter`, `GridMultiSelectFilter`, in the
  filter panel: `dialog` set, which the grid passes as `IDataGridFilterBarProps.inDialog`)

## What changed

In the filter panel the two helpers now read their `options` as they do in the header's bar,
where BaseSelector shows them:

- An option with `hidden: true` is not listed. A value that is selected stays selected (the
  multi-select keeps it when the user ticks or unticks another value), but it has no radio or
  checkbox.
- An option with `isDisabled: true` is shown greyed out, and its radio or checkbox is disabled:
  a click on it or on its text does not call `onSelect`. A selected disabled value stays
  selected and cannot be unticked.
- A `[text, node]` label shows only its node, also on an `isSmallLabel` entry. Before, the panel
  printed both, so `["Alpha", <b>Alpha</b>]` read "AlphaAlpha", and the radio or checkbox was
  named by both.

The bar is unchanged.

## Why

The panel read only `isDivider`, `isSmallLabel` and `label` and passed the label through as
given. The same options therefore listed a hidden entry, let the user pick a disabled one and
printed a `[text, node]` label twice in the panel, while the bar's dropdown left the hidden
entry out, refused the disabled one and showed the node. A grid switches between the bar and
the panel by its width, so the filter's choices depended on the window size.

## Migration

Required for an app that marks an option `isDisabled` or `hidden` for its forms but wants it
pickable in a grid filter: without a change, the panel now behaves like the bar and the option
cannot be picked there either. Clear the flags when building the filter's options:

```tsx
<GridSingleSelectFilter
	options={TYPE_OPTIONS.map((option) => ({
		...option,
		isDisabled: false,
		hidden: false,
	}))}
	{...otherProps}
/>
```
