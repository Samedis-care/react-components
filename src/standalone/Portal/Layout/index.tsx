import React, { useCallback, useState } from "react";
import Header from "./Header";
import Menu from "./Menu";
import { makeStyles } from "@material-ui/core/styles";
import { Hidden } from "@material-ui/core";

export interface IProps {
	topLeft: JSX.Element;
	headerContent: JSX.Element;
	menuContent: JSX.Element;
	content: JSX.Element;
	drawerWidth: number;
}

const useContainerStyles = makeStyles(() => ({
	containerDesktop: (props: IProps) => ({
		display: "grid",
		gridTemplateAreas: `"top-left top" "sidebar main"`,
		gridTemplateRows: "max-content 100fr",
		gridTemplateColumns: `${props.drawerWidth}px 100fr`,
		height: "100%",
	}),
	containerMobile: (props: IProps) => ({
		display: "grid",
		gridTemplateAreas: `"top top" "main main"`,
		gridTemplateRows: "max-content 100fr",
		gridTemplateColumns: `${props.drawerWidth}px 100fr`,
		height: "100%",
	}),
}));

const useStyles = makeStyles(() => ({
	header: {
		gridArea: "top",
	},
	topLeft: {
		gridArea: "top-left",
	},
	menu: {
		gridArea: "sidebar",
	},
	main: {
		gridArea: "main",
	},
}));

const RenderLayout = (props: IProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = useCallback(
		() => setMenuOpen((prevState) => !prevState),
		[]
	);
	const classes = useStyles(props);

	return (
		<>
			<div className={classes.topLeft}>{props.topLeft}</div>
			<div className={classes.header}>
				<Header contents={props.headerContent} toggleMenu={toggleMenu} />
			</div>
			<div className={classes.menu}>
				<Menu
					menuOpen={menuOpen}
					drawerWidth={props.drawerWidth}
					toggleMenu={toggleMenu}
					items={props.menuContent}
				/>
			</div>
			<div className={classes.main}>{props.content}</div>
		</>
	);
};

export default (props: IProps) => {
	const classes = useContainerStyles(props);

	return (
		<>
			<Hidden xsDown implementation="js">
				<div className={classes.containerDesktop}>
					<RenderLayout {...props} />
				</div>
			</Hidden>
			<Hidden smUp implementation="js">
				<div className={classes.containerMobile}>
					<RenderLayout {...props} />
				</div>
			</Hidden>
		</>
	);
};
