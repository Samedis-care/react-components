# SubActionButton takes `color`, and an icon keeps its own color

- **Date:** 2026-11-27
- **Kind:** behavior, DOM
- **Scope:** `standalone/UIKit` (`SubActionButton`)

## What changed

- `color` takes effect. The label and the icon are the palette color's `main`, at rest and on
  hover (a custom palette color included), and the hover of a `small` button fills the cell
  with its `light` and paints the icon in `getContrastText(light)`. `"inherit"` takes the
  parent's text color. The top border, the divider between rows, stays grey, and a disabled
  button stays `text.disabled`. `components.CcSubActionButton.defaultProps.color` in the theme
  colors every SubActionButton. `color` used to change nothing.
- The icon is rendered in a `span` with the class `CcSubActionButton-icon`, and painted through
  that span's text color, which an SvgIcon fills with. The library no longer sets `fill` on the
  `svg`, so an icon with a color of its own (an SvgIcon's `color` or `htmlColor`, or a color in
  its `sx`) keeps it, at rest, on hover and while disabled. Every `svg` in the button used to be
  filled `primary.main` (`text.disabled` while disabled), whatever its own color.

Without `color`, and with an icon without a color of its own, a SubActionButton looks as
before: the label is `text.primary` and turns `primary.main` on hover, the icon is
`primary.main`, and a `small` button's hover fills the cell with `primary.light`.

## Why

A destructive entry of an action menu ("Delete") is shown in the error color. `color`, which
SubActionButton accepts as MUI's Button does, was overridden by the component's own text color
and icon fill, so an app had to restyle the button and the `svg` with selectors that beat the
library's. An icon given its own color was repainted primary as well.

## Migration

Required for any app that paints a SubActionButton in a palette color through a `styled()`
wrapper or a theme override that sets the text `color` and an `svg` `fill`: pass `color`
instead and drop the wrapper. The library's disabled rule no longer reaches the `svg`, so with
the wrapper a disabled button keeps the wrapper's icon fill instead of `text.disabled`.

```tsx
// was:
// const DangerSubActionButton = styled(SubActionButton)(({ theme }) => ({
// 	color: theme.palette.error.main,
// 	"&.MuiButton-outlined svg": { fill: theme.palette.error.main },
// }));
<SubActionButton color="error" icon={<DeleteIcon />} onClick={onDelete}>
	{t("delete")}
</SubActionButton>
```

Required for any app whose styles or tests select a SubActionButton's icon as a direct child
of the button (`button > svg`, `:scope > svg`): the icon is now inside
`span.CcSubActionButton-icon`. A descendant selector (`button svg`) still matches.

An app that passes an icon with a color of its own to a SubActionButton now sees that color
instead of primary; remove the icon's color to keep the primary look.
