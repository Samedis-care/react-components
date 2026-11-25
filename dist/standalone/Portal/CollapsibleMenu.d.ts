import React, { CSSProperties } from "react";
export interface CollapsibleMenuProps {
    /**
     * The actual menu (Menu/RoutedMenu)
     *
     * Hidden (`display: none`) while collapsed on desktop. The mobile layout has no
     * collapse button, so there it is always shown; a menu collapsed on desktop is
     * collapsed again when the layout returns to desktop.
     */
    children: React.ReactNode;
    /**
     * Width of the menu (excluding collapse area)
     */
    width?: CSSProperties["width"];
    /**
     * CSS class name
     */
    className?: string;
    /**
     * Custom styles (for collapse)
     */
    classes?: Partial<Record<CollapsibleMenuClassKey, string>>;
}
export type CollapsibleMenuClassKey = "root" | "content" | "bar" | "iconOpen" | "iconClose" | "button";
/**
 * Desktop collapse for a menu, e.g. around the menu in PortalLayout's
 * `menuContent`: a button right of the menu ("Collapse menu" / "Expand menu")
 * hides the menu, leaving only the 48px button bar. In the mobile layout the
 * button is not rendered and the menu is always shown.
 *
 * Must be rendered inside a PortalLayout (it reads `usePortalLayoutContext`);
 * outside one it throws "PortalLayoutContext not set".
 */
declare const _default: React.MemoExoticComponent<(inProps: CollapsibleMenuProps) => React.JSX.Element>;
export default _default;
