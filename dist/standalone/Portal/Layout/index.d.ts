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
export declare type PortalLayoutProps = PortalLayoutPropsBase & (PortalLayoutBasic | PortalLayoutNoTopLeft);
export interface PortalLayoutContextType {
    mobile: boolean;
    menuOpen: boolean;
    setMenuOpen: Dispatch<SetStateAction<boolean>>;
}
export declare const PortalLayoutContext: React.Context<PortalLayoutContextType | undefined>;
export declare const usePortalLayoutContext: () => PortalLayoutContextType;
declare const _default: React.MemoExoticComponent<(props: PortalLayoutProps) => JSX.Element>;
export default _default;
