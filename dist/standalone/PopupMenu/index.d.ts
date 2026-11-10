import React from "react";
import { MenuProps } from "@mui/material";
export type PopupMenuClassKey = "root";
/**
 * Props of {@link PopupMenu}: MUI's `MenuProps`, with a different default for
 * `elevation`.
 */
export interface PopupMenuProps extends MenuProps {
    /**
     * The shadow depth of the menu paper, an index into `theme.shadows`. The
     * border outlines the menu, so by default it has no shadow; a value above 0
     * draws MUI's shadow of that depth in addition to the border.
     * @default 0
     */
    elevation?: MenuProps["elevation"];
}
declare const _default: (props: PopupMenuProps) => React.JSX.Element;
export default _default;
