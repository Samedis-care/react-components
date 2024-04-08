import React from "react";
import { MenuItemProps } from "../../Menu";
import { TypographyProps } from "@mui/material";
export type MenuItemMaterialClassKey = "root";
export interface MenuItemMaterialProps {
    typographyProps?: TypographyProps;
}
declare const _default: React.MemoExoticComponent<(inProps: MenuItemProps & MenuItemMaterialProps) => React.JSX.Element>;
export default _default;
