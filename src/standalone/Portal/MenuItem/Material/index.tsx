import React from "react";
import { MenuItemProps } from "../../Menu";
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	styled,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const StyledListItem = styled(ListItemButton, {
	name: "CcMenuItemMaterial",
	slot: "root",
})({});

export type MenuItemMaterialClassKey = "root";

export interface MenuItemMaterialProps {
	typographyProps?: TypographyProps;
}

const MenuItemMaterial = (inProps: MenuItemProps & MenuItemMaterialProps) => {
	const props = useThemeProps({ props: inProps, name: "CcMenuItemMaterial" });

	const Icon = props.icon;
	return (
		<StyledListItem
			onClick={props.onClick}
			onAuxClick={props.onAuxClick}
			selected={props.active}
		>
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
			<ListItemText primary={props.title} />
			{props.expandable && (props.expanded ? <ExpandLess /> : <ExpandMore />)}
		</StyledListItem>
	);
};

export default React.memo(MenuItemMaterial);
