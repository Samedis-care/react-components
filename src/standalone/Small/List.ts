import {
	ListItem,
	ListItemButton,
	ListItemButtonProps,
	ListItemIcon,
	ListItemProps,
	styled,
} from "@mui/material";

// The gutters replace MUI's 16px in the states MUI sets them in. They are
// variants on the props rather than nested selectors, so they stay plain
// declarations and sx, theme overrides and styled() wrappers still win.
const hasItemGutters = ({ disableGutters, disablePadding }: ListItemProps) =>
	!disableGutters && !disablePadding;
const itemGutters = (left: number, right: number) => ({
	variants: [
		{ props: hasItemGutters, style: { paddingLeft: left } },
		{
			// with secondaryAction the right padding stays MUI's 48px
			props: (props: ListItemProps) =>
				hasItemGutters(props) && !props.secondaryAction,
			style: { paddingRight: right },
		},
	],
});
const buttonGutters = (left: number, right: number) => ({
	variants: [
		{
			props: ({ disableGutters }: ListItemButtonProps) => !disableGutters,
			style: { paddingLeft: left, paddingRight: right },
		},
	],
});

/**
 * MUI `ListItem` with 8px left and right gutters instead of MUI's 16px.
 * Vertical padding is MUI's (`dense` reduces it); `disableGutters` removes
 * the gutters, `disablePadding` all padding. With `secondaryAction` the right
 * padding stays MUI's 48px. Takes all `ListItem` props.
 */
export const SmallListItem = styled(ListItem)(
	itemGutters(8, 8),
) as typeof ListItem;
/**
 * MUI `ListItemButton` with 8px left and right gutters instead of MUI's
 * 16px; `disableGutters` removes them. Renders a `div[role=button]`, so inside
 * a `List` wrap it in `<ListItem disablePadding>`. Takes all `ListItemButton`
 * props; `selected` only changes the look, so add the ARIA state yourself.
 */
export const SmallListItemButton = styled(ListItemButton)(
	buttonGutters(8, 8),
) as typeof ListItemButton;

/**
 * MUI `ListItem` with no left and an 8px right gutter, for rows whose icon
 * provides the left inset. `disableGutters` removes the gutters,
 * `disablePadding` all padding. With `secondaryAction` the right padding stays
 * MUI's 48px. Takes all `ListItem` props.
 */
export const SelectorSmallListItem = styled(ListItem)(
	itemGutters(0, 8),
) as typeof ListItem;

/**
 * MUI `ListItemButton` with no left and an 8px right gutter; `disableGutters`
 * removes them. The Selector's option rows are built on it and set their own
 * 16px gutters. Takes all `ListItemButton` props.
 */
export const SelectorSmallListItemButton = styled(ListItemButton)(
	buttonGutters(0, 8),
) as typeof ListItemButton;

/**
 * MUI `ListItemIcon` without MUI's 56px `min-width`, with an 8px gap
 * (`padding-right`) before the text. Takes all `ListItemIcon` props.
 */
export const SmallListItemIcon = styled(ListItemIcon)({
	minWidth: 0,
	paddingRight: 8,
}) as typeof ListItemIcon;
