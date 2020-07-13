import { AppBar, Hidden, IconButton, Toolbar } from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import React from "react";

interface IProps {
	/**
	 * Callback to toggle the menu drawer on mobile view
	 */
	toggleMenu: () => void;
	/**
	 * The actual user-specified contents to display
	 */
	contents: React.ReactNode;
}

export default (props: IProps) => {
	return (
		<>
			<Hidden smUp implementation={"js"}>
				<AppBar position={"relative"}>
					<Toolbar>
						<IconButton onClick={props.toggleMenu}>
							<MenuIcon />
						</IconButton>
						{props.contents}
					</Toolbar>
				</AppBar>
			</Hidden>
			<Hidden xsDown implementation={"js"}>
				<AppBar position={"relative"}>
					<Toolbar>{props.contents}</Toolbar>
				</AppBar>
			</Hidden>
		</>
	);
};
