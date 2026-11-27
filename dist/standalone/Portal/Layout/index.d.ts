import React, { Dispatch, SetStateAction } from "react";
import { PortalLayoutHeaderProps } from "./Header";
import { Breakpoint } from "@mui/material/styles";
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
export type PortalLayoutProps = PortalLayoutPropsBase & (PortalLayoutBasic | PortalLayoutNoTopLeft);
export interface PortalLayoutContainerOwnerState {
    mobile: boolean;
    variant: PortalLayoutProps["variant"];
    drawerWidth: PortalLayoutProps["drawerWidth"];
}
export type PortalLayoutClassKey = "container";
/**
 * Style slots of the layout's areas (theme name `CcPortalRenderLayout`):
 * `header`, `topLeft`, `menu` (the menu column), `nav` (the `<nav>` around
 * `menuContent`, in the menu column or the drawer), `main` (the `<main>` around
 * `content`); in mobile view, `mobileTopLeft` (the `topLeft` row at the top of
 * the drawer) and `closeMenuButton` (the drawer's close button, shown while it
 * has keyboard focus).
 */
export type PortalRenderLayoutClassKey = "header" | "topLeft" | "menu" | "nav" | "main" | "mobileTopLeft" | "closeMenuButton";
export interface PortalLayoutContextType {
    mobile: boolean;
    menuOpen: boolean;
    setMenuOpen: Dispatch<SetStateAction<boolean>>;
}
export declare const PortalLayoutContext: React.Context<PortalLayoutContextType | undefined>;
export declare const usePortalLayoutContext: () => PortalLayoutContextType;
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
declare const _default: React.MemoExoticComponent<(inProps: PortalLayoutProps) => React.JSX.Element>;
export default _default;
