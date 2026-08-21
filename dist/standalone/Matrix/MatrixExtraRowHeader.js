import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { styled } from "@mui/material";
import { cssVar, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
export const MatrixExtraRowHeaderRoot = styled("div", {
    name: "CcMatrixGrid",
    slot: "extraRowHeader",
})(({ theme }) => ({
    position: "sticky",
    left: 0,
    zIndex: 1,
    height: cssVar(matrixVars.extraRowHeight),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    ...cellBorders(theme),
}));
const MatrixExtraRowHeader = (props) => {
    const { classes } = useMatrixConfig();
    return (_jsx(MatrixExtraRowHeaderRoot, { className: classes?.extraRowHeader, children: props.extraRow.header }));
};
export default React.memo(MatrixExtraRowHeader);
