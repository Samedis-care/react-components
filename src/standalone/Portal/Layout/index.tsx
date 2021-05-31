import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import Header, { PortalLayoutHeaderProps } from "./Header";
import Menu from "./Menu";
import { makeStyles } from "@material-ui/core/styles";
import { useMediaQuery, useTheme } from "@material-ui/core";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

interface PortalLayoutBasic {
	/**
	 * Basic Layout
	 */
	variant: "basic";
	/**
	 * Content displayed on the top-left corner of the screen
	 */
	topLeft: React.ReactNode;
}

interface PortalLayoutNoTopLeft {
	/**
	 * Layout with only Header, Menu and Content
	 */
	variant: "no-top-left";
}

interface PortalLayoutPropsBase {
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
	drawerWidth?: number;
	/**
	 * Should we collapse the menu? (forces mobile view)
	 */
	collapseMenu?: boolean;
	/**
	 * Media query which forces mobile view if true
	 */
	mobileViewCondition?: string;
	/**
	 * Menu collapse breakpoint (defaults to sm)
	 */
	collapseBreakpoint?: Breakpoint;
	/**
	 * CSS Styles to apply
	 */
	customClasses?: {
		header?: PortalLayoutHeaderProps["customClasses"];
	};
	/**
	 * ID for the header
	 */
	headerId?: string;
	/**
	 * ID for the navbar
	 */
	menuId?: string;
	/**
	 * ID for the main content
	 */
	mainId?: string;
}

interface IRenderProps {
	/**
	 * Is mobile view?
	 */
	mobile: boolean;
}

export type PortalLayoutProps = PortalLayoutPropsBase &
	(PortalLayoutBasic | PortalLayoutNoTopLeft);

const useContainerStyles = makeStyles(
	{
		containerDesktop: (props: PortalLayoutProps) => ({
			display: "grid",
			gridTemplateAreas:
				props.variant === "basic"
					? `"top-left top" "sidebar main"`
					: `"top top" "sidebar main"`,
			gridTemplateRows: "max-content 100fr",
			gridTemplateColumns: `${
				props.drawerWidth ? `${props.drawerWidth}px` : "max-content"
			} 100fr`,
			height: "100%",
		}),
		containerMobile: (props: PortalLayoutProps) => ({
			display: "grid",
			gridTemplateAreas: `"top top" "main main"`,
			gridTemplateRows: "max-content 100fr",
			gridTemplateColumns: `${
				props.drawerWidth ? `${props.drawerWidth}px` : "max-content"
			} 100fr`,
			height: "100%",
		}),
	},
	{ name: "CcPortalLayout" }
);

const useStyles = makeStyles(
	{
		header: {
			gridArea: "top",
		},
		topLeft: {
			gridArea: "top-left",
		},
		menu: {
			gridArea: "sidebar",
			minHeight: "100%",
		},
		main: {
			gridArea: "main",
			overflow: "auto",
		},
		mobileTopLeft: {
			height: 56,
		},
	},
	{ name: "CcRenderLayout" }
);

export interface PortalLayoutContextType {
	mobile: boolean;
	menuOpen: boolean;
	setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export const PortalLayoutContext = createContext<
	PortalLayoutContextType | undefined
>(undefined);

export const usePortalLayoutContext = (): PortalLayoutContextType => {
	const ctx = useContext(PortalLayoutContext);
	if (!ctx) throw new Error("PortalLayoutContext not set");
	return ctx;
};

const RenderLayout = (props: PortalLayoutProps & IRenderProps) => {
	const { mobile, headerContent, drawerWidth, menuContent, content } = props;
	const [menuOpen, setMenuOpen] = useState(false);

	const toggleMenu = useCallback(() => setMenuOpen((prevState) => !prevState), [
		setMenuOpen,
	]);
	const classes = useStyles(props);

	const portalContext = useMemo(
		() => ({
			mobile,
			menuOpen,
			setMenuOpen,
		}),
		[mobile, menuOpen, setMenuOpen]
	);

	return (
		<PortalLayoutContext.Provider value={portalContext}>
			{!props.mobile && props.variant === "basic" && (
				<div className={classes.topLeft}>{props.topLeft}</div>
			)}
			<div id={props.headerId} className={classes.header}>
				{headerContent && (
					<Header
						contents={headerContent}
						toggleMenu={toggleMenu}
						mobile={mobile && !!menuContent}
						customClasses={props.customClasses?.header}
					/>
				)}
			</div>
			<div id={props.menuId} className={classes.menu}>
				{menuContent && (
					<Menu
						menuOpen={menuOpen}
						drawerWidth={drawerWidth}
						toggleMenu={toggleMenu}
						mobile={mobile}
						items={
							<>
								{mobile && props.variant === "basic" && (
									<div className={classes.mobileTopLeft}>{props.topLeft}</div>
								)}
								{menuContent}
							</>
						}
					/>
				)}
			</div>
			<div id={props.mainId} className={classes.main}>
				{content}
			</div>
		</PortalLayoutContext.Provider>
	);
};

const RenderLayoutMemo = React.memo(RenderLayout);

const PortalLayout = (props: PortalLayoutProps) => {
	const classes = useContainerStyles(props);
	const theme = useTheme();
	const mobileViewConditionMet = useMediaQuery(
		props.mobileViewCondition || "()"
	);
	const shouldCollapse = useMediaQuery(
		theme.breakpoints.down(props.collapseBreakpoint ?? "sm")
	);
	const mobile = !!(
		shouldCollapse ||
		props.collapseMenu ||
		(props.mobileViewCondition && mobileViewConditionMet)
	);

	return (
		<div
			className={mobile ? classes.containerMobile : classes.containerDesktop}
		>
			<RenderLayoutMemo mobile={mobile} {...props} />
		</div>
	);
};

export default React.memo(PortalLayout);
