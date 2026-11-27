import React from "react";
import { MenuItemProps } from "../../Menu";
import { TypographyProps } from "@mui/material";
/**
 * Theme style slot of MaterialMenuItem
 * (`components.CcMenuItemMaterial.styleOverrides.root`): the ListItemButton.
 *
 * The active entry has MUI's `Mui-selected` class and by default, besides MUI's
 * selected tint, a bar in the primary color on its left edge (its `::before`)
 * and a medium-weight title (`.MuiListItemText-primary`). A theme restyles them
 * under `root: { "&.Mui-selected::before": { … } }` and
 * `root: { "&.Mui-selected .MuiListItemText-primary": { … } }`; keep a mark
 * that is not a color only, as forced-colors mode replaces the background.
 */
export type MenuItemMaterialClassKey = "root";
export interface MenuItemMaterialProps {
    typographyProps?: TypographyProps;
}
/**
 * Menu entry renderer (exported as `MaterialMenuItem`) for MenuBase and
 * RoutedMenu: an MUI ListItemButton with an icon column, the title, and an
 * expand chevron for groups. The active entry is `selected`: MUI's selected
 * tint, a bar in the primary color on its left edge and a medium-weight title.
 */
declare const _default: React.MemoExoticComponent<(inProps: MenuItemProps & MenuItemMaterialProps) => React.JSX.Element>;
export default _default;
