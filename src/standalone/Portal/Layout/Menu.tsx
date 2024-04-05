import { Drawer, Paper, styled, useTheme, useThemeProps } from "@mui/material";
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
	 * The width of the menu
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
})({});

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
				PaperProps={paperProps}
				ModalProps={modalProps}
				className={combineClassNames([className, classes?.menuDrawer])}
			>
				{props.items}
			</MenuDrawer>
		);
	}
};

export default React.memo(PortalLayoutMenu);
