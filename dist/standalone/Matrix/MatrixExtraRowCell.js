import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef } from "react";
import { styled } from "@mui/material";
import { Add } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import { columnVariantClass, cssVar, matrixClasses, matrixVars, } from "./matrixClasses";
import { cellBorders, columnTintStyles } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
import useMatrixActivation from "./useMatrixActivation";
export const MatrixExtraCellRoot = styled("div", {
    name: "CcMatrixGrid",
    slot: "extraCell",
})(({ theme }) => ({
    height: cssVar(matrixVars.extraRowHeight),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...cellBorders(theme),
    ...columnTintStyles(theme),
    [`&.${matrixClasses.extraCellClickable}`]: {
        cursor: "pointer",
        "&:hover": { backgroundColor: theme.palette.action.hover },
        "&:hover .MuiSvgIcon-root": { opacity: 1 },
        // No hover on a touch device, so the hint has to be there from the
        // start: without it the cell is an empty button.
        [`&.${matrixClasses.touch} .MuiSvgIcon-root`]: { opacity: 1 },
        "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
        },
    },
}));
export const MatrixBadge = styled("div", {
    name: "CcMatrixGrid",
    slot: "badge",
})(({ theme }) => ({
    minWidth: 22,
    height: 22,
    padding: theme.spacing(0, 0.5),
    borderRadius: 11,
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    fontSize: "0.72rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));
export const MatrixExtraCellAddHint = styled(Add, {
    name: "CcMatrixGrid",
    slot: "extraCellAddHint",
})(({ theme }) => ({
    fontSize: 15,
    opacity: 0,
    color: theme.palette.text.disabled,
}));
const MatrixExtraRowCell = (props) => {
    const { extraRow, column } = props;
    const { classes, touch } = useMatrixConfig();
    const onCellClick = extraRow.onCellClick;
    const activate = useCallback(() => {
        onCellClick?.(column.key);
    }, [onCellClick, column.key]);
    const activation = useMatrixActivation(onCellClick ? activate : undefined, extraRow.getCellLabel?.(column.key) ?? extraRow.label);
    const ref = useRef(null);
    const { tabStop, pullFocus, onNavigate, onFocusColumn } = props;
    useEffect(() => {
        if (pullFocus)
            ref.current?.focus();
    }, [pullFocus]);
    const handleFocus = useCallback(() => {
        onFocusColumn(column.key);
    }, [onFocusColumn, column.key]);
    // The arrow keys walk the row; Enter and Space come from the activation.
    const handleKeyDown = useCallback((event) => {
        const to = event.key === "ArrowRight"
            ? "next"
            : event.key === "ArrowLeft"
                ? "previous"
                : event.key === "Home"
                    ? "first"
                    : event.key === "End"
                        ? "last"
                        : null;
        if (!to) {
            activation?.onKeyDown(event);
            return;
        }
        event.preventDefault();
        onNavigate(column.key, to);
    }, [activation, onNavigate, column.key]);
    // Zero is a value: only a missing (or null) badge means "nothing known".
    const badge = extraRow.badges?.[column.key];
    const clickable = !!onCellClick;
    return (_jsx(MatrixExtraCellRoot, { className: combineClassNames([
            classes?.extraCell,
            columnVariantClass(column.variant),
            clickable && matrixClasses.extraCellClickable,
            touch && matrixClasses.touch,
        ]), ...activation, ref: ref, tabIndex: clickable ? (tabStop ? 0 : -1) : undefined, onKeyDown: clickable ? handleKeyDown : undefined, onFocus: clickable ? handleFocus : undefined, children: badge != null ? (_jsx(MatrixBadge, { className: classes?.badge, children: badge })) : (clickable && (_jsx(MatrixExtraCellAddHint, { className: classes?.extraCellAddHint }))) }));
};
export default React.memo(MatrixExtraRowCell);
