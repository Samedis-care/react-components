import React, { CSSProperties } from "react";
import { GridProps, IconButtonProps } from "@mui/material";
export interface CollapsibleMenuProps {
    /**
     * The actual menu (Menu/RoutedMenu)
     */
    children: React.ReactNode;
    /**
     * Custom styles for some child components
     */
    customClasses?: {
        root?: GridProps["className"];
        button?: IconButtonProps["className"];
    };
    /**
     * Width of the menu (excluding collapse area)
     */
    width?: CSSProperties["width"];
    /**
     * Custom styles (for collapse)
     */
    classes?: Partial<ReturnType<typeof useStyles>>;
}
declare const useStyles: (props?: any) => import("@mui/styles").ClassNameMap<"content" | "container" | "bar" | "iconOpen" | "iconClose">;
declare const _default: React.MemoExoticComponent<(props: CollapsibleMenuProps) => JSX.Element>;
export default _default;
