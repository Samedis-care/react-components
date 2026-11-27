import React from "react";
import { MenuItemProps } from "../../Menu";
import {
	ListItemButton,
	listItemButtonClasses,
	ListItemIcon,
	ListItemText,
	listItemTextClasses,
	styled,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import focusRing from "../../focusRing";

/** width of the bar on the active entry's left edge, in px */
const ACTIVE_BAR_WIDTH = 4;

const StyledListItem = styled(ListItemButton, {
	name: "CcMenuItemMaterial",
	slot: "root",
})(({ theme }) => ({
	...focusRing(theme.palette.primary.main),
	// not MUI's selected tint only, which forced-colors mode replaces: a bar on
	// the left edge and a medium-weight title. The bar is a border (forced colors
	// keep borders) on an overlay, so the title stays in line with the others.
	[`&.${listItemButtonClasses.selected}`]: {
		"&::before": {
			content: '""',
			position: "absolute",
			top: 0,
			bottom: 0,
			left: 0,
			borderLeft: `${ACTIVE_BAR_WIDTH}px solid ${(theme.vars || theme).palette.primary.main}`,
			pointerEvents: "none",
		},
		[`& .${listItemTextClasses.primary}`]: {
			fontWeight: theme.typography.fontWeightMedium,
		},
	},
}));

/**
 * Theme style slot of MaterialMenuItem
 * (`components.CcMenuItemMaterial.styleOverrides.root`): the ListItemButton.
 *
 * The active entry has MUI's `Mui-selected` class and by default, besides MUI's
 * selected tint, a bar in the primary color on its left edge (its `::before`)
 * and a medium-weight title (`.MuiListItemText-primary`). A theme restyles them
 * under `root: { "&.Mui-selected::before": { … } }` and
 * `root: { "&.Mui-selected .MuiListItemText-primary": { … } }`; keep a mark
 * that is not a color only, as forced-colors mode replaces the background.
 */
export type MenuItemMaterialClassKey = "root";

export interface MenuItemMaterialProps {
	typographyProps?: TypographyProps;
}

const MenuItemMaterial = (inProps: MenuItemProps & MenuItemMaterialProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMenuItemMaterial" });

	const Icon = props.icon;
	return (
		<StyledListItem
			ref={props.focusRef}
			onClick={props.onClick}
			onAuxClick={props.onAuxClick}
			{...props.ariaAttributes}
			selected={props.active}
		>
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
			<ListItemText primary={props.title} />
			{props.expandable && (props.expanded ? <ExpandLess /> : <ExpandMore />)}
		</StyledListItem>
	);
};

/**
 * Menu entry renderer (exported as `MaterialMenuItem`) for MenuBase and
 * RoutedMenu: an MUI ListItemButton with an icon column, the title, and an
 * expand chevron for groups. The active entry is `selected`: MUI's selected
 * tint, a bar in the primary color on its left edge and a medium-weight title.
 */
export default React.memo(MenuItemMaterial);
