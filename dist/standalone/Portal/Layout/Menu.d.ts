import React from "react";
export interface PortalLayoutMenuProps {
    /**
     * Is the menu open? (if non-permanent)
     */
    menuOpen: boolean;
    /**
     * Is mobile view?
     *
     * false renders a full-height Paper, true a temporary Drawer. A change moves
     * `items` from one to the other without remounting them.
     */
    mobile: boolean;
    /**
     * The width of the menu, in px
     *
     * In mobile view the drawer is never wider than the screen minus 56px, so a
     * strip of backdrop stays to tap to close it.
     */
    drawerWidth?: number;
    /**
     * The id of the drawer's paper in mobile view
     *
     * The paper is the drawer's dialog element, which holds the items; the
     * burger names it in its `aria-controls`. The drawer is kept mounted while
     * closed, so the id is in the document for as long as the drawer is
     * rendered. Not set on the desktop Paper. Undefined: no id.
     */
    drawerId?: string;
    /**
     * Callback to toggle the menu open/closed
     */
    toggleMenu: () => void;
    /**
     * The menu items
     *
     * Mounted once and kept mounted when `mobile` changes, so they keep their
     * state (a menu's active entry and expanded groups, a collapsed
     * CollapsibleMenu). They are rendered into an element with
     * `display: contents` inside the Paper or the drawer's paper, so they lay out
     * as the paper's children. Escape pressed in them closes the drawer
     * (`toggleMenu`), as on the drawer itself.
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
