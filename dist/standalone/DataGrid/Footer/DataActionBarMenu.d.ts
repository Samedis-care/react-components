import React from "react";
import { MenuProps } from "@mui/material";
import { DataGridProps } from "../DataGrid";
export interface DataActionBarMenuProps {
    anchorEl: MenuProps["anchorEl"];
    customButtons: NonNullable<DataGridProps["customDataActionButtons"]>;
    onClose: () => void;
    numSelected: 0 | 1 | 2;
    selectAll: boolean;
    handleCustomButtonClick: (label: string) => void;
    /**
     * The props of the menu's slots, MUI Menu's `slotProps`; `list` gives the
     * menu an id and names it by the element that opened it (see useMenuButton)
     */
    slotProps?: MenuProps["slotProps"];
}
declare const _default: React.MemoExoticComponent<(props: DataActionBarMenuProps) => React.JSX.Element>;
export default _default;
