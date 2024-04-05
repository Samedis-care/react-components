import React from "react";
import { MenuItemProps } from "../../../Menu";
import {
	ListItemButton,
	ListItemIcon,
	ListItemText,
	styled,
	TypographyProps,
	useThemeProps,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import combineClassNames from "../../../../../utils/combineClassNames";

const MyListItem = styled(ListItemButton, {
	name: "CcMenuItemJumboReactDark",
	slot: "root",
})(({ theme }) => ({
	borderBottomRightRadius: "30px",
	borderTopRightRadius: "30px",
	width: "calc(100% - 20px)",
	color: "#a1a1a1",
	"&.Mui-active": {
		backgroundColor: theme.palette.primary.main,
		color: theme.palette.getContrastText(theme.palette.primary.main),
	},
	"& .MuiListItemButton-button:hover": {
		color: "white",
		backgroundColor: "#1d1d1d",
		"&.Mui-active": {
			backgroundColor: theme.palette.primary.main,
		},
		"&.Cc-expandable": {
			backgroundColor: "transparent",
		},
	},
}));

const StyledListItemIcon = styled(ListItemIcon, {
	name: "CcMenuItemJumboReactDark",
	slot: "icon",
})({
	color: "inherit",
});

const Dot = styled("div", { name: "CcMenuItemJumboReactDark", slot: "dot" })(
	({ theme }) => ({
		width: 6,
		height: 6,
		backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
		borderRadius: "50%",
		top: "50%",
	}),
);

export type MenuItemJumboReactDarkClassKey = "root" | "icon" | "dot";

const typographyProps: Pick<TypographyProps, "variant"> = { variant: "body2" };

export interface MenuItemJumboReactDarkProps {
	typographyProps?: TypographyProps;
}

const MenuItemJumboReactDark = (
	inProps: MenuItemProps & MenuItemJumboReactDarkProps,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcMenuItemJumboReactDark",
	});

	const Icon = props.icon;
	return (
		<MyListItem
			onClick={props.onClick}
			onAuxClick={props.onAuxClick}
			className={combineClassNames([
				props.active && "Mui-active",
				props.expandable && "Cc-expandable",
			])}
		>
			<StyledListItemIcon>{Icon && <Icon />}</StyledListItemIcon>
			<ListItemText
				primary={props.title}
				primaryTypographyProps={props.typographyProps ?? typographyProps}
			/>
			{props.expandable && (props.expanded ? <ExpandLess /> : <ExpandMore />)}
			{props.active && <Dot />}
		</MyListItem>
	);
};

export default React.memo(MenuItemJumboReactDark);
