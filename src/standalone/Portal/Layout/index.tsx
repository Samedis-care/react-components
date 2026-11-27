import React, {
	createContext,
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import Header, { PortalLayoutHeaderProps } from "./Header";
import Menu from "./Menu";
import { Breakpoint } from "@mui/material/styles";
import {
	buttonBaseClasses,
	IconButton,
	styled,
	useMediaQuery,
	useTheme,
	useThemeProps,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import useCCTranslations from "../../../utils/useCCTranslations";
import focusRing from "../focusRing";
import useResetScrollOnNavigation from "../../Routes/useResetScrollOnNavigation";

interface PortalLayoutBasic {
	/**
	 * Basic Layout
	 */
	variant: "basic";
	/**
	 * Content displayed on the top-left corner of the screen
	 *
	 * In mobile view it is the first row of the drawer, 56px high. The drawer's
	 * close button, shown while it has keyboard focus, sits over that row and
	 * comes before it in the Tab order.
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
	 *
	 * It is rendered in the page's navigation landmark, a `<nav>` named "Main
	 * menu" (`standalone.portal.main-menu`) that fills the menu paper (a flex
	 * column, so a menu with `height: 100%` fills it and scrolls inside it). Do
	 * not wrap it in a `<nav>` of its own. Falsy: no menu, no `<nav>` and no
	 * burger.
	 *
	 * In mobile view it is shown in a drawer that the burger button opens. The
	 * burger says whether the drawer is open (`aria-expanded`) and names it
	 * (`aria-controls`, an id the layout generates).
	 * Escape, a click on the backdrop and the drawer's close button ("Close
	 * menu", `standalone.portal.close-menu`) close it; focus then returns to the
	 * element that had it before the drawer opened, usually the burger. The
	 * close button is for screen readers and keyboard users: it is visually
	 * hidden and takes no space, is the first stop of Tab in the drawer, and is
	 * shown at the top of the drawer, over the content, only while it has
	 * keyboard focus.
	 */
	menuContent: React.ReactNode;
	/**
	 * Main content
	 *
	 * It is rendered in the page's main landmark, a `<main>` element (the `main`
	 * slot), so it must not contain a `<main>` of its own. The `<main>` can take
	 * focus without being a stop of Tab (`tabindex="-1"`), see `mainId`.
	 *
	 * It scrolls in a pane of its own, the `<main>`. Inside a HistoryRouter
	 * (Framework renders one), a navigation scrolls the pane to the top as it
	 * scrolls the window, unless the navigation keeps the scroll position
	 * (`preventScrollReset` of `useNavigate`, e.g. a RoutedTabs tab switch).
	 */
	content: React.ReactNode;
	/**
	 * The width of the menu area
	 *
	 * In px. Sets the menu column and the menu paper on desktop, and the drawer
	 * width on mobile. The drawer is never wider than the screen minus 56px, so
	 * a strip of backdrop stays to tap to close it (320 gives a 264px drawer on
	 * a 320px phone).
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
	 *
	 * Set on the `<nav>` around `menuContent`, in desktop and in mobile view (in
	 * the drawer, which is kept mounted while closed). Not set without
	 * `menuContent`, which renders no `<nav>`.
	 */
	menuId?: string;
	/**
	 * ID for the main content
	 *
	 * Set on the `<main>` around `content`, the pane the content scrolls in. It
	 * takes focus (`focus()`, e.g. after a client-side navigation, or a skip
	 * link such as `<Link to={"#" + mainId}>`) without being a stop of Tab.
	 * Focused, the arrow and page keys scroll it, and Tab goes on to the first
	 * focusable element of the content; focused from the keyboard, it shows a
	 * 2px focus ring in the primary color inside its edge.
	 */
	mainId?: string;
	/**
	 * custom CSS class to apply
	 */
	className?: string;
}

interface IRenderProps {
	/**
	 * Is mobile view?
	 */
	mobile: boolean;
}

export type PortalLayoutProps = PortalLayoutPropsBase &
	(PortalLayoutBasic | PortalLayoutNoTopLeft);

export interface PortalLayoutContainerOwnerState {
	mobile: boolean;
	variant: PortalLayoutProps["variant"];
	drawerWidth: PortalLayoutProps["drawerWidth"];
}
const Container = styled("div", {
	name: "CcPortalLayout",
	slot: "container",
})<{ ownerState: PortalLayoutContainerOwnerState }>(
	({ ownerState: { variant, drawerWidth, mobile } }) => ({
		display: "grid",
		height: "100%",
		gridTemplateRows: "max-content 100fr",
		gridTemplateColumns: `${
			drawerWidth ? `${drawerWidth}px` : "max-content"
		} 100fr`,
		gridTemplateAreas: mobile
			? `"top top" "main main"`
			: variant === "basic"
				? `"top-left top" "sidebar main"`
				: `"top top" "sidebar main"`,
	}),
);
export type PortalLayoutClassKey = "container";

const RenderLayoutHeader = styled("div", {
	name: "CcPortalRenderLayout",
	slot: "header",
})({ gridArea: "top" });
const RenderLayoutTopLeft = styled("div", {
	name: "CcPortalRenderLayout",
	slot: "topLeft",
})({ gridArea: "top-left" });
const RenderLayoutMenu = styled("div", {
	name: "CcPortalRenderLayout",
	slot: "menu",
})({ gridArea: "sidebar", minHeight: "100%" });
// the page's navigation landmark around menuContent, in the desktop paper and
// in the drawer. It fills the paper (below the drawer's topLeft row) as
// menuContent did without it: a flex column that may shrink below its content,
// so a menu with height 100% fills it and scrolls inside it.
const RenderLayoutNav = styled("nav", {
	name: "CcPortalRenderLayout",
	slot: "nav",
})({
	height: "100%",
	minHeight: 0,
	display: "flex",
	flexDirection: "column",
});
// the page's main landmark and the pane the pages scroll in
const RenderLayoutMain = styled("main", {
	name: "CcPortalRenderLayout",
	slot: "main",
})(({ theme }) => ({
	gridArea: "main",
	overflow: "auto",
	display: "flex",
	flexDirection: "column",
	// focused from the keyboard (a skip link), or by a script after keyboard
	// use: the Portal's focus ring, inside the pane, where the screen's edge
	// cannot clip it
	"&:focus-visible": {
		outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
		outlineOffset: -2,
	},
}));
const RenderLayoutMobileTopLeft = styled("div", {
	name: "CcPortalRenderLayout",
	slot: "mobileTopLeft",
})({ height: 56 });
// The drawer's close button, for screen readers and keyboard users. Visually
// hidden and out of the flow, so the drawer looks as without it; shown only while
// it has keyboard focus (as a skip link), at the top of the drawer, over the
// content. The X lines up with the end of the menu entries (16px inset).
const RenderLayoutCloseMenuButton = styled(IconButton, {
	name: "CcPortalRenderLayout",
	slot: "closeMenuButton",
})(
	({ theme }) => ({
		position: "absolute",
		top: theme.spacing(0.5),
		insetInlineEnd: theme.spacing(0.5),
		zIndex: 1,
		[`&.${buttonBaseClasses.focusVisible}`]: {
			// the drawer's surface, with its overlay in a dark theme, so the
			// content it covers does not show through
			backgroundColor: (theme.vars || theme).palette.background.paper,
			backgroundImage: "var(--Paper-overlay)",
		},
		[`&:not(.${buttonBaseClasses.focusVisible})`]: {
			// visually hidden, as MUI's visuallyHidden
			border: 0,
			clipPath: "inset(50%)",
			height: 1,
			margin: -1,
			overflow: "hidden",
			padding: 0,
			whiteSpace: "nowrap",
			width: 1,
		},
	}),
	({ theme }) => focusRing((theme.vars || theme).palette.primary.main),
);
/**
 * Style slots of the layout's areas (theme name `CcPortalRenderLayout`):
 * `header`, `topLeft`, `menu` (the menu column), `nav` (the `<nav>` around
 * `menuContent`, in the menu column or the drawer), `main` (the `<main>` around
 * `content`); in mobile view, `mobileTopLeft` (the `topLeft` row at the top of
 * the drawer) and `closeMenuButton` (the drawer's close button, shown while it
 * has keyboard focus).
 */
export type PortalRenderLayoutClassKey =
	| "header"
	| "topLeft"
	| "menu"
	| "nav"
	| "main"
	| "mobileTopLeft"
	| "closeMenuButton";

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
	// the mobile drawer's paper, named by the burger's aria-controls
	const drawerId = useId();
	// the pane the pages scroll in: a navigation starts the next page at its top
	const mainRef = useRef<HTMLElement>(null);
	useResetScrollOnNavigation(mainRef);
	const { t } = useCCTranslations();

	const toggleMenu = useCallback(
		() => setMenuOpen((prevState) => !prevState),
		[setMenuOpen],
	);
	// closes, never toggles: a second click while the drawer slides out keeps it closed
	const closeMenu = useCallback(() => setMenuOpen(false), [setMenuOpen]);

	const portalContext = useMemo(
		() => ({
			mobile,
			menuOpen,
			setMenuOpen,
		}),
		[mobile, menuOpen, setMenuOpen],
	);

	return (
		<PortalLayoutContext.Provider value={portalContext}>
			{!props.mobile && props.variant === "basic" && (
				<RenderLayoutTopLeft>{props.topLeft}</RenderLayoutTopLeft>
			)}
			<RenderLayoutHeader id={props.headerId}>
				{headerContent && (
					<Header
						contents={headerContent}
						toggleMenu={toggleMenu}
						mobile={mobile && !!menuContent}
						drawerId={drawerId}
						customClasses={props.customClasses?.header}
					/>
				)}
			</RenderLayoutHeader>
			<RenderLayoutMenu>
				{menuContent && (
					<Menu
						menuOpen={menuOpen}
						drawerWidth={drawerWidth}
						toggleMenu={toggleMenu}
						mobile={mobile}
						drawerId={drawerId}
						items={
							<>
								{mobile && (
									<RenderLayoutCloseMenuButton
										onClick={closeMenu}
										size={"large"}
										aria-label={t("standalone.portal.close-menu")}
									>
										<CloseIcon />
									</RenderLayoutCloseMenuButton>
								)}
								{mobile && props.variant === "basic" && (
									<RenderLayoutMobileTopLeft>
										{props.topLeft}
									</RenderLayoutMobileTopLeft>
								)}
								<RenderLayoutNav
									id={props.menuId}
									aria-label={t("standalone.portal.main-menu")}
								>
									{menuContent}
								</RenderLayoutNav>
							</>
						}
					/>
				)}
			</RenderLayoutMenu>
			{/* tabIndex -1: focus() and skip links can move the focus to the
			content, without adding a stop to the Tab order */}
			<RenderLayoutMain id={props.mainId} ref={mainRef} tabIndex={-1}>
				{content}
			</RenderLayoutMain>
		</PortalLayoutContext.Provider>
	);
};

const RenderLayoutMemo = React.memo(RenderLayout);

const PortalLayout = (inProps: PortalLayoutProps) => {
	const props = useThemeProps({ props: inProps, name: "CcPortalLayout" });
	const { className, ...rendererProps } = props;
	const theme = useTheme();
	const mobileViewConditionMet = useMediaQuery(
		props.mobileViewCondition || "()",
	);
	const shouldCollapse = useMediaQuery(
		theme.breakpoints.down(props.collapseBreakpoint ?? "md"),
	);
	const mobile = !!(
		shouldCollapse ||
		props.collapseMenu ||
		(props.mobileViewCondition && mobileViewConditionMet)
	);

	return (
		<Container
			ownerState={{
				mobile,
				variant: props.variant,
				drawerWidth: props.drawerWidth,
			}}
			className={className}
		>
			<RenderLayoutMemo mobile={mobile} {...rendererProps} />
		</Container>
	);
};

/**
 * App shell: a header (an MUI AppBar, the page's banner landmark), a menu (in
 * the page's navigation landmark) and the content (in the page's main
 * landmark), laid out as a CSS grid that fills its parent's height.
 *
 * Below `collapseBreakpoint`, with `collapseMenu`, or while
 * `mobileViewCondition` matches, the menu moves into a drawer that a burger
 * button in the header opens. Descendants read the mode and the drawer state
 * with {@link usePortalLayoutContext}.
 */
export default React.memo(PortalLayout);
