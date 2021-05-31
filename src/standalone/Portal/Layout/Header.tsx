import {
	AppBar,
	AppBarProps,
	IconButton,
	Toolbar,
	ToolbarProps,
} from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import React from "react";

export interface PortalLayoutHeaderProps {
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
	/**
	 * CSS styles to apply
	 */
	customClasses?: {
		appBar?: AppBarProps["classes"];
		toolbar?: ToolbarProps["classes"];
	};
}

const PortalLayoutHeader = (props: PortalLayoutHeaderProps) => {
	const { mobile, customClasses, toggleMenu, contents } = props;

	return (
		<AppBar position={"relative"} classes={customClasses?.appBar}>
			<Toolbar classes={customClasses?.toolbar}>
				{mobile && (
					<IconButton onClick={toggleMenu}>
						<MenuIcon />
					</IconButton>
				)}
				{contents}
			</Toolbar>
		</AppBar>
	);
};

export default React.memo(PortalLayoutHeader);
