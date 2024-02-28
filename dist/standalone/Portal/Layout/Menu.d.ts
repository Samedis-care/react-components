import React from "react";
interface IProps {
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
}
declare const _default: React.MemoExoticComponent<(props: IProps) => React.JSX.Element>;
export default _default;
