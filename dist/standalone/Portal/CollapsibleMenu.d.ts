import React, { CSSProperties } from "react";
export interface CollapsibleMenuProps {
    /**
     * The actual menu (Menu/RoutedMenu)
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
declare const _default: React.MemoExoticComponent<(inProps: CollapsibleMenuProps) => React.JSX.Element>;
export default _default;
