import React from "react";
export interface PortalLayoutMenuProps {
    /**
     * Is the menu open? (if non-permanent)
     */
    menuOpen: boolean;
    /**
     * Is mobile view?
     */
    mobile: boolean;
    /**
     * The width of the menu
     */
    drawerWidth?: number;
    /**
     * Callback to toggle the menu open/closed
     */
    toggleMenu: () => void;
    /**
     * The menu items
     */
    items: React.ReactNode;
    /**
     * class name to apply to drawer/paper
     */
    className?: string;
    /**
     * CSS classes
     */
    classes?: Partial<Record<PortalLayoutMenuClassKey, string>>;
}
export type PortalLayoutMenuClassKey = "menuPaper" | "menuDrawer";
declare const _default: React.MemoExoticComponent<(inProps: PortalLayoutMenuProps) => React.JSX.Element>;
export default _default;
