import {
	Drawer,
	drawerClasses,
	Paper,
	styled,
	useTheme,
	useThemeProps,
} from "@mui/material";
import React, { useMemo } from "react";
import combineClassNames from "../../../utils/combineClassNames";

export interface PortalLayoutMenuProps {
	/**
	 * Is the menu open? (if non-permanent)
	 */
	menuOpen: boolean;
	/**
	 * Is mobile view?
	 */
	mobile: boolean;
	/**
	 * The width of the menu, in px
	 *
	 * In mobile view the drawer is never wider than the screen minus 56px, so a
	 * strip of backdrop stays to tap to close it.
	 */
	drawerWidth?: number;
	/**
	 * Callback to toggle the menu open/closed
	 */
	toggleMenu: () => void;
	/**
	 * The menu items
	 */
	items: React.ReactNode;
	/**
	 * class name to apply to drawer/paper
	 */
	className?: string;
	/**
	 * CSS classes
	 */
	classes?: Partial<Record<PortalLayoutMenuClassKey, string>>;
}

const modalProps = {
	keepMounted: true, // Better open performance on mobile.
};

const MenuPaper = styled(Paper, {
	name: "CcPortalLayoutMenu",
	slot: "menuPaper",
})({
	height: "100%",
});

const MenuDrawer = styled(Drawer, {
	name: "CcPortalLayoutMenu",
	slot: "menuDrawer",
})({
	// leave a strip of backdrop to tap on any screen, also with drawerWidth
	// (Material: a modal navigation drawer is at most the screen width minus 56px)
	[`& .${drawerClasses.paper}`]: {
		maxWidth: "calc(100% - 56px)",
	},
});

export type PortalLayoutMenuClassKey = "menuPaper" | "menuDrawer";

const PortalLayoutMenu = (inProps: PortalLayoutMenuProps) => {
	const props = useThemeProps({ props: inProps, name: "CcPortalLayoutMenu" });
	const { menuOpen, toggleMenu, drawerWidth, className, classes } = props;
	const theme = useTheme();

	const paperProps = useMemo(
		() => ({
			style: { width: drawerWidth },
		}),
		[drawerWidth],
	);

	if (!props.mobile) {
		return (
			<MenuPaper
				{...paperProps}
				className={combineClassNames([className, classes?.menuPaper])}
			>
				{props.items}
			</MenuPaper>
		);
	} else {
		return (
			<MenuDrawer
				variant={"temporary"}
				anchor={theme.direction === "rtl" ? "right" : "left"}
				open={menuOpen}
				onClose={toggleMenu}
				slotProps={{ paper: paperProps }}
				ModalProps={modalProps}
				className={combineClassNames([className, classes?.menuDrawer])}
			>
				{props.items}
			</MenuDrawer>
		);
	}
};

export default React.memo(PortalLayoutMenu);
