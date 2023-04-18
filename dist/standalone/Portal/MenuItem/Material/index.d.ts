import React from "react";
import { MenuItemProps } from "../../Menu";
import { CSSProperties } from "@mui/styles";
export interface MenuItemTheme {
    borderRadius?: CSSProperties["borderRadius"];
    border?: CSSProperties["border"];
    backgroundColor?: CSSProperties["backgroundColor"];
    color?: CSSProperties["color"];
    padding?: CSSProperties["padding"];
    margin?: CSSProperties["margin"];
    height?: CSSProperties["height"];
    width?: CSSProperties["width"];
    overflow?: CSSProperties["overflow"];
    style?: CSSProperties;
    icon?: {
        color?: CSSProperties["color"];
        style?: CSSProperties;
    };
}
declare const _default: React.MemoExoticComponent<(props: MenuItemProps) => JSX.Element>;
export default _default;
