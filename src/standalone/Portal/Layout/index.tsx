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
import { Breakpoint } from "@mui/material/styles";
import { styled, useMediaQuery, useTheme, useThemeProps } from "@mui/material";

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
const RenderLayoutMain = styled("div", {
	name: "CcPortalRenderLayout",
	slot: "main",
})({
	gridArea: "main",
	overflow: "auto",
	display: "flex",
	flexDirection: "column",
});
const RenderLayoutMobileTopLeft = styled("div", {
	name: "CcPortalRenderLayout",
	slot: "mobileTopLeft",
})({ height: 56 });
export type PortalRenderLayoutClassKey =
	| "header"
	| "topLeft"
	| "menu"
	| "main"
	| "mobileTopLeft";

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

	const toggleMenu = useCallback(
		() => setMenuOpen((prevState) => !prevState),
		[setMenuOpen],
	);

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
						customClasses={props.customClasses?.header}
					/>
				)}
			</RenderLayoutHeader>
			<RenderLayoutMenu id={props.menuId}>
				{menuContent && (
					<Menu
						menuOpen={menuOpen}
						drawerWidth={drawerWidth}
						toggleMenu={toggleMenu}
						mobile={mobile}
						items={
							<>
								{mobile && props.variant === "basic" && (
									<RenderLayoutMobileTopLeft>
										{props.topLeft}
									</RenderLayoutMobileTopLeft>
								)}
								{menuContent}
							</>
						}
					/>
				)}
			</RenderLayoutMenu>
			<RenderLayoutMain id={props.mainId}>{content}</RenderLayoutMain>
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

export default React.memo(PortalLayout);
