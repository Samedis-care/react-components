import {
	AppBar,
	IconButton,
	Toolbar,
	withStyles,
	Theme,
} from "@material-ui/core";
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

const StyledAppBar = withStyles((theme: Theme) => ({
	root: {
		backgroundColor: theme.componentsCare?.portal?.header?.backgroundColor,
		height: theme.componentsCare?.portal?.header?.height,
	},
}))(AppBar);

const StyledToolbar = withStyles((theme: Theme) => ({
	root: {
		height: theme.componentsCare?.portal?.header?.height,
		minHeight: theme.componentsCare?.portal?.header?.height,
	},
}))(Toolbar);

const PortalLayoutHeader = (props: IProps) => {
	if (props.mobile) {
		return (
			<AppBar position={"relative"} color="secondary">
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
			<StyledAppBar position={"relative"} color="secondary">
				<StyledToolbar>{props.contents}</StyledToolbar>
			</StyledAppBar>
		);
	}
};

export default React.memo(PortalLayoutHeader);
