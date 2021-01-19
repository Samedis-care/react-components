import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useState,
} from "react";
import Header from "./Header";
import Menu from "./Menu";

import {
	Hidden,
	Grid,
	IconButton,
	makeStyles,
	useMediaQuery,
	Theme,
} from "@material-ui/core";
import { Menu as MenuIcon } from "@material-ui/icons";

export interface PortalLayoutProps {
	/**
	 * Content displayed on the top-left corner of the screen
	 */
	topLeft?: React.ReactNode;
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
	/**
	 * Should we collapse the menu? (forces mobile view)
	 */
	collapseMenu?: boolean;
	/**
	 * Media query which forces mobile view if true
	 */
	mobileViewCondition?: string;
}

interface IRenderProps {
	/**
	 * Is mobile view?
	 */
	mobile: boolean;
}

const useContainerStyles = makeStyles(() => ({
	containerDesktop: (props: PortalLayoutProps) => ({
		display: "grid",
		gridTemplateAreas: `"top top" 
							"sidebar main"`,
		gridTemplateRows: "max-content 100fr",
		gridTemplateColumns: `${props.drawerWidth}px 100fr`,
		height: "100%",
	}),
	containerMobile: (props: PortalLayoutProps) => ({
		display: "grid",
		gridTemplateAreas: `"top top"
						    "main main"`,
		gridTemplateRows: "max-content 100fr",
		gridTemplateColumns: `${props.drawerWidth}px 100fr`,
		height: "100%",
	}),
}));

const useStyles = makeStyles((theme: Theme) => ({
	header: {
		gridArea: "top",
		backgroundColor: theme.componentsCare?.portal?.header?.backgroundColor,
	},
	menu: {
		gridArea: "sidebar",
		backgroundColor: theme.componentsCare?.portal?.menu?.backgroundColor,
		selected: {
			backgroundColor: "red",
		},
	},
	main: {
		gridArea: "main",
	},
	mobileTopLeft: {
		gridArea: "top",
		height: 56,
	},
}));

export const PortalLayoutMenuContext = createContext<
	[boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined);

const RenderLayout = (props: PortalLayoutProps & IRenderProps) => {
	const menuState = useState(false);
	const [menuOpen, setMenuOpen] = menuState;

	const toggleMenu = useCallback(() => setMenuOpen((prevState) => !prevState), [
		setMenuOpen,
	]);
	const classes = useStyles(props);

	return (
		<PortalLayoutMenuContext.Provider value={menuState}>
			<div className={classes.header}>
				<Header
					contents={props.headerContent}
					toggleMenu={toggleMenu}
					mobile={props.mobile}
				/>
			</div>
			<div className={classes.menu}>
				<Menu
					menuOpen={menuOpen}
					drawerWidth={menuOpen ? props.drawerWidth : 50}
					toggleMenu={toggleMenu}
					mobile={props.mobile}
					items={
						<Grid container>
							<Grid item>
								{props.mobile && (
									<div className={classes.mobileTopLeft}>{props.topLeft}</div>
								)}
								{/* {!props.mobile && (
								<MenuItem onClick={toggleMenu}>
									<IconButton>
										{menuOpen ? <MenuOpenIcon /> : <MenuIcon />}
									</IconButton>
								</MenuItem>
							)} */}
								{/* {menuOpen && props.menuContent} */}
								{props.menuContent}
							</Grid>
							<Grid item>
								<IconButton>
									<MenuIcon />
								</IconButton>
							</Grid>
						</Grid>
					}
				/>
			</div>
			<div className={classes.main}>{props.content}</div>
		</PortalLayoutMenuContext.Provider>
	);
};

const RenderLayoutMemo = React.memo(RenderLayout);

const PortalLayout = (props: PortalLayoutProps) => {
	const classes = useContainerStyles(props);
	const mobileViewConditionMet = useMediaQuery(
		props.mobileViewCondition || "()"
	);
	if (props.mobileViewCondition) {
		const mobile = props.collapseMenu || mobileViewConditionMet;

		return (
			<div
				className={mobile ? classes.containerMobile : classes.containerDesktop}
			>
				<RenderLayoutMemo mobile={mobile} {...props} />
			</div>
		);
	}

	return (
		<>
			<Hidden xsDown implementation="js">
				<div
					className={
						props.collapseMenu
							? classes.containerMobile
							: classes.containerDesktop
					}
				>
					<RenderLayoutMemo mobile={!!props.collapseMenu} {...props} />
				</div>
			</Hidden>
			<Hidden smUp implementation="js">
				<div className={classes.containerMobile}>
					<RenderLayoutMemo mobile={true} {...props} />
				</div>
			</Hidden>
		</>
	);
};

export default React.memo(PortalLayout);
