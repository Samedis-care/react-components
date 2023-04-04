import { AppBarProps, ToolbarProps } from "@material-ui/core";
import React from "react";
export interface PortalLayoutHeaderProps {
    /**
     * Callback to toggle the menu drawer on mobile view
     */
    toggleMenu: () => void;
    /**
     * Show mobile view?
     */
    mobile: boolean;
    /**
     * The actual user-specified contents to display
     */
    contents: React.ReactNode;
    /**
     * CSS styles to apply
     */
    customClasses?: {
        appBar?: AppBarProps["classes"];
        toolbar?: ToolbarProps["classes"];
    };
}
declare const _default: React.MemoExoticComponent<(props: PortalLayoutHeaderProps) => JSX.Element>;
export default _default;
