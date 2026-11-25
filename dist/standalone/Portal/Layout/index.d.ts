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
export type PortalLayoutProps = PortalLayoutPropsBase & (PortalLayoutBasic | PortalLayoutNoTopLeft);
export interface PortalLayoutContainerOwnerState {
    mobile: boolean;
    variant: PortalLayoutProps["variant"];
    drawerWidth: PortalLayoutProps["drawerWidth"];
}
export type PortalLayoutClassKey = "container";
/**
 * Style slots of the layout's areas (theme name `CcPortalRenderLayout`):
 * `header`, `topLeft`, `menu`, `main`; in mobile view, `mobileTopLeft` (the
 * `topLeft` row at the top of the drawer) and `closeMenuButton` (the drawer's
 * close button, shown while it has keyboard focus).
 */
export type PortalRenderLayoutClassKey = "header" | "topLeft" | "menu" | "main" | "mobileTopLeft" | "closeMenuButton";
export interface PortalLayoutContextType {
    mobile: boolean;
    menuOpen: boolean;
    setMenuOpen: Dispatch<SetStateAction<boolean>>;
}
export declare const PortalLayoutContext: React.Context<PortalLayoutContextType | undefined>;
export declare const usePortalLayoutContext: () => PortalLayoutContextType;
declare const _default: React.MemoExoticComponent<(inProps: PortalLayoutProps) => React.JSX.Element>;
export default _default;
