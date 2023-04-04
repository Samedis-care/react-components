import React from "react";
import { MenuProps } from "@material-ui/core";
/**
 * Reset button callbacks
 */
export interface ResetCallbacks {
    refresh: () => void;
    resetFilter: () => void;
    resetSort: () => void;
    resetColumn: () => void;
    resetWidth: () => void;
    resetAll: () => void;
}
export interface ResetMenuProps extends ResetCallbacks {
    /**
     * The menu anchor
     */
    anchorEl: MenuProps["anchorEl"];
    /**
     * The menu onClose handler
     */
    onClose: () => void;
}
declare const _default: React.MemoExoticComponent<(props: ResetMenuProps) => JSX.Element>;
export default _default;
