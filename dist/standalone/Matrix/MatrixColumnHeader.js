import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
import { columnVariantClass, cssVar, matrixClasses, matrixVars, } from "./matrixClasses";
import { cellBorders, stickyColumnTintStyles } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
export const MatrixColumnHeaderRoot = styled("div", {
    name: "CcMatrixGrid",
    slot: "columnHeader",
})(({ theme }) => {
    return {
        position: "sticky",
        top: 0,
        zIndex: 2,
        height: cssVar(matrixVars.headerHeight),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1.1,
        ...cellBorders(theme),
        // the accent column also gets an underline in its header
        ...stickyColumnTintStyles(theme, {
            boxShadow: `inset 0 -3px 0 ${theme.palette.info.main}`,
        }),
    };
});
export const MatrixColumnHeaderLabel = styled("div", {
    name: "CcMatrixGrid",
    slot: "columnHeaderLabel",
})(({ theme }) => ({
    fontWeight: 700,
    fontSize: "0.8rem",
    [`.${matrixClasses.columnCurrent} > &`]: {
        color: theme.palette.mode === "dark"
            ? theme.palette.warning.light
            : theme.palette.warning.dark,
    },
    [`.${matrixClasses.columnAccent} > &`]: {
        color: theme.palette.info.main,
    },
}));
export const MatrixColumnHeaderSubLabel = styled("div", {
    name: "CcMatrixGrid",
    slot: "columnHeaderSubLabel",
})(({ theme }) => ({
    fontSize: "0.62rem",
    textTransform: "uppercase",
    color: theme.palette.text.secondary,
}));
const MatrixColumnHeader = (props) => {
    const { column } = props;
    const { renderColumnHeader, classes } = useMatrixConfig();
    const content = useMemo(() => renderColumnHeader ? (renderColumnHeader(column)) : (_jsxs(_Fragment, { children: [_jsx(MatrixColumnHeaderLabel, { className: classes?.columnHeaderLabel, children: column.label }), column.subLabel != null && (_jsx(MatrixColumnHeaderSubLabel, { className: classes?.columnHeaderSubLabel, children: column.subLabel }))] })), [
        renderColumnHeader,
        column,
        classes?.columnHeaderLabel,
        classes?.columnHeaderSubLabel,
    ]);
    return (_jsx(MatrixColumnHeaderRoot, { ref: props.innerRef, className: combineClassNames([
            classes?.columnHeader,
            columnVariantClass(column.variant),
        ]), children: content }));
};
export default React.memo(MatrixColumnHeader);
