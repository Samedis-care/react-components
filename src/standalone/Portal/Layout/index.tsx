import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useState,
} from "react";
import Header from "./Header";
import Menu from "./Menu";
import { makeStyles } from "@material-ui/core/styles";
import { Hidden, useMediaQuery } from "@material-ui/core";

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

export const PortalLayoutMenuContext = createContext<
	[boolean, Dispatch<SetStateAction<boolean>>] | undefined
>(undefined);

const RenderLayout = React.memo((props: IProps & IRenderProps) => {
	const menuState = useState(false);
	const [menuOpen, setMenuOpen] = menuState;

	const toggleMenu = useCallback(() => setMenuOpen((prevState) => !prevState), [
		setMenuOpen,
	]);
	const classes = useStyles(props);

	return (
		<PortalLayoutMenuContext.Provider value={menuState}>
			{!props.mobile && <div className={classes.topLeft}>{props.topLeft}</div>}
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
					drawerWidth={props.drawerWidth}
					toggleMenu={toggleMenu}
					mobile={props.mobile}
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
		</PortalLayoutMenuContext.Provider>
	);
});

export default React.memo((props: IProps) => {
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
				<RenderLayout mobile={mobile} {...props} />
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
					<RenderLayout mobile={!!props.collapseMenu} {...props} />
				</div>
			</Hidden>
			<Hidden smUp implementation="js">
				<div className={classes.containerMobile}>
					<RenderLayout mobile={true} {...props} />
				</div>
			</Hidden>
		</>
	);
});
