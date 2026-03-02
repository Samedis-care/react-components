import React from "react";
import { MenuProps } from "@mui/material";
import { DataGridProps } from "../DataGrid";
export interface DataActionBarMenuProps {
    anchorEl: MenuProps["anchorEl"];
    customButtons: NonNullable<DataGridProps["customDataActionButtons"]>;
    onClose: () => void;
    numSelected: number;
    handleCustomButtonClick: (label: string) => void;
}
declare const _default: React.MemoExoticComponent<(props: DataActionBarMenuProps) => React.JSX.Element>;
export default _default;
