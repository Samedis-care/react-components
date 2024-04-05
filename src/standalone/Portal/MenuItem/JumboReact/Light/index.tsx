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
	name: "CcMenuItemJumboReactLight",
	slot: "root",
})(({ theme }) => ({
	borderBottomRightRadius: "30px",
	borderTopRightRadius: "30px",
	width: "calc(100% - 20px)",
	"&.Mui-active": {
		color: theme.palette.getContrastText(theme.palette.primary.main),
		backgroundColor: theme.palette.primary.main,
	},
	"& .MuiListItemButton-button:hover": {
		color: theme.palette.primary.main,
		backgroundColor: "transparent",
		"&.Cc-expandable": {
			color: "unset",
			backgroundColor: "transparent",
		},
		"&.Mui-active": {
			backgroundColor: theme.palette.primary.main,
		},
	},
}));

const Dot = styled("div", { name: "CcMenuItemJumboReactLight", slot: "dot" })(
	({ theme }) => ({
		width: 6,
		height: 6,
		backgroundColor: theme.palette.getContrastText(theme.palette.primary.main),
		borderRadius: "50%",
		top: "50%",
	}),
);

export type MenuItemJumboReactLightClassKey = "root" | "dot";

const typographyProps: Pick<TypographyProps, "variant"> = { variant: "body2" };

export interface MenuItemJumboReactLightProps {
	typographyProps?: TypographyProps;
}

const MenuItemJumboReactLight = (
	inProps: MenuItemProps & MenuItemJumboReactLightProps,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcMenuItemJumboReactLight",
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
			<ListItemIcon>{Icon && <Icon />}</ListItemIcon>
			<ListItemText
				primary={props.title}
				primaryTypographyProps={props.typographyProps ?? typographyProps}
			/>
			{props.expandable && (props.expanded ? <ExpandLess /> : <ExpandMore />)}
			{props.active && <Dot />}
		</MyListItem>
	);
};

export default React.memo(MenuItemJumboReactLight);
