import React, { useCallback, useState } from "react";
import Header from "./Header";
import Menu from "./Menu";
import { makeStyles } from "@material-ui/core/styles";
import { Hidden } from "@material-ui/core";

export interface IProps {
	/**
	 * Content displayed on the top-left corner of the screen
	 */
	topLeft: React.ReactNode;
	/**
	 * Content displayed inside the header
	 */
	headerContent: React.ReactNode;
	/**
	 * Content displayed in the menu area (usually a Menu)
	 */
	menuContent: React.ReactNode;
	/**
	 * Main content
	 */
	content: React.ReactNode;
	/**
	 * The width of the menu area
	 */
	drawerWidth: number;
}

interface IRenderProps {
	/**
	 * Is mobile view?
	 */
	mobile?: boolean;
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
	mobileTopLeft: {
		height: 56,
	},
}));

const RenderLayout = React.memo((props: IProps & IRenderProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = useCallback(
		() => setMenuOpen((prevState) => !prevState),
		[]
	);
	const classes = useStyles(props);

	return (
		<>
			{!props.mobile && <div className={classes.topLeft}>{props.topLeft}</div>}
			<div className={classes.header}>
				<Header contents={props.headerContent} toggleMenu={toggleMenu} />
			</div>
			<div className={classes.menu}>
				<Menu
					menuOpen={menuOpen}
					drawerWidth={props.drawerWidth}
					toggleMenu={toggleMenu}
					items={
						<>
							{props.mobile && (
								<div className={classes.mobileTopLeft}>{props.topLeft}</div>
							)}
							{props.menuContent}
						</>
					}
				/>
			</div>
			<div className={classes.main}>{props.content}</div>
		</>
	);
});

export default React.memo((props: IProps) => {
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
					<RenderLayout mobile {...props} />
				</div>
			</Hidden>
		</>
	);
});
