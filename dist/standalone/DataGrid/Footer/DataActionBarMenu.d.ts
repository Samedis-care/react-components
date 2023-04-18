import React from "react";
import { MenuProps } from "@mui/material";
import { DataGridProps } from "../DataGrid";
export interface DataActionBarMenuProps {
    anchorEl: MenuProps["anchorEl"];
    customButtons: NonNullable<DataGridProps["customDataActionButtons"]>;
    onClose: () => void;
    numSelected: 0 | 1 | 2;
    handleCustomButtonClick: (label: string) => void;
}
declare const _default: React.MemoExoticComponent<(props: DataActionBarMenuProps) => JSX.Element>;
export default _default;
