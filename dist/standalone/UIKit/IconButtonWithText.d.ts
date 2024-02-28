import React from "react";
import { IconButtonProps, TypographyProps } from "@mui/material";
export interface IconButtonWithTextProps {
    IconButtonProps?: Omit<IconButtonProps, "children" | "onClick">;
    TypographyProps?: Omit<TypographyProps, "children" | "onClick">;
    text: TypographyProps["children"];
    icon: IconButtonProps["children"];
    onClick?: IconButtonProps["onClick"];
}
declare const _default: React.MemoExoticComponent<(props: IconButtonWithTextProps) => React.JSX.Element>;
export default _default;
