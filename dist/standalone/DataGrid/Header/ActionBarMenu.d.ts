import React from "react";
import { MenuProps } from "@mui/material";
export interface ActionBarMenuProps {
    anchorEl: MenuProps["anchorEl"];
    toggleSettings?: (evt: React.MouseEvent) => void;
    openResetDialog?: (evt: React.MouseEvent) => void;
    openExportMenu?: (evt: React.MouseEvent) => void;
    handleImport?: (evt: React.MouseEvent) => void;
    onClose: () => void;
}
declare const _default: React.MemoExoticComponent<(props: ActionBarMenuProps) => React.JSX.Element>;
export default _default;