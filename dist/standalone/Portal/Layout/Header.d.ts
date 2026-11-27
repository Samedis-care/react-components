import { AppBarProps, ToolbarProps } from "@mui/material";
import React from "react";
export interface PortalLayoutHeaderProps {
    /**
     * Callback to toggle the menu drawer on mobile view
     */
    toggleMenu: () => void;
    /**
     * Show mobile view?
     *
     * true renders the burger button, which tells assistive technology whether
     * the drawer is open (`aria-expanded`, from the layout's `menuOpen`) and
     * which element the drawer is (`aria-controls`, `drawerId`). Its icon has
     * the AppBar's text color (`color="inherit"`), whatever color the theme
     * gives IconButtons.
     */
    mobile: boolean;
    /**
     * The id of the drawer the burger opens, named by the burger's
     * `aria-controls`
     *
     * Set on the drawer's paper (PortalLayoutMenu's `drawerId`), which stays
     * mounted while the drawer is closed, so the reference resolves whenever the
     * burger is shown.
     */
    drawerId: string;
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
declare const _default: React.MemoExoticComponent<(props: PortalLayoutHeaderProps) => React.JSX.Element>;
export default _default;
