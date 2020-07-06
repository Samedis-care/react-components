import {
	AppBar,
	Hidden,
	IconButton,
	Toolbar
} from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";
import React from "react";

interface IProps {
	toggleMenu: () => void;
	contents: React.Component;
}

export default (props: IProps) => {
	return (
		<>
			<Hidden smUp implementation={"js"}>
				<AppBar position={"absolute"}>
					<Toolbar>
						<IconButton onClick={props.toggleMenu}>
							<MenuIcon />
						</IconButton>
						{props.contents}
					</Toolbar>
				</AppBar>
			</Hidden>
			<Hidden xsDown implementation={"js"}>
				<AppBar position={"absolute"}>
					<Toolbar>
						{props.contents}
					</Toolbar>
				</AppBar>
			</Hidden>
		</>
	);
}