import { AppBar, IconButton, Toolbar } from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import React from "react";

interface IProps {
	/**
	 * Callback to toggle the menu drawer on mobile view
	 */
	toggleMenu: () => void;
	/**
	 * Show mobile view?
	 */
	mobile: boolean;
	/**
	 * The actual user-specified contents to display
	 */
	contents: React.ReactNode;
}

const PortalLayoutHeader = (props: IProps) => {
	if (props.mobile) {
		return (
			<AppBar position={"relative"}>
				<Toolbar>
					<IconButton onClick={props.toggleMenu}>
						<MenuIcon />
					</IconButton>
					{props.contents}
				</Toolbar>
			</AppBar>
		);
	} else {
		return (
			<AppBar position={"relative"}>
				<Toolbar>{props.contents}</Toolbar>
			</AppBar>
		);
	}
};

export default React.memo(PortalLayoutHeader);
