import { Drawer, Paper, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import makeStyles from "@mui/styles/makeStyles";

interface IProps {
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
}

const modalProps = {
	keepMounted: true, // Better open performance on mobile.
};

const useStyles = makeStyles(
	{
		menuPaper: (props: IProps) => ({
			width: props.drawerWidth,
			height: "100%",
		}),
	},
	{ name: "CcPortalLayoutMenu" },
);

const PortalLayoutMenu = (props: IProps) => {
	const { menuOpen, toggleMenu } = props;
	const theme = useTheme();
	const classes = useStyles(props);

	const paperProps = useMemo(
		() => ({
			className: classes.menuPaper,
		}),
		[classes.menuPaper],
	);

	if (!props.mobile) {
		return <Paper {...paperProps}>{props.items}</Paper>;
	} else {
		return (
			<Drawer
				variant={"temporary"}
				anchor={theme.direction === "rtl" ? "right" : "left"}
				open={menuOpen}
				onClose={toggleMenu}
				PaperProps={paperProps}
				ModalProps={modalProps}
			>
				{props.items}
			</Drawer>
		);
	}
};

export default React.memo(PortalLayoutMenu);
