import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useId, useMemo } from "react";
import { styled } from "@mui/material";
import { useTranslation } from "react-i18next";
import ccI18n from "../../i18n";
import combineClassNames from "../../utils/combineClassNames";
import { cssVar, matrixClasses, matrixVars } from "./matrixClasses";
import { cellBorders } from "./matrixTints";
import { useMatrixConfig } from "./MatrixGridContext";
import MatrixContents from "./MatrixContents";
import useMatrixActivation from "./useMatrixActivation";
export const MatrixRowHeaderRoot = styled("div", {
    name: "CcMatrixGrid",
    slot: "rowHeader",
})(({ theme }) => ({
    position: "sticky",
    left: 0,
    zIndex: 1,
    height: cssVar(matrixVars.rowHeight),
    minWidth: 0,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
    ...cellBorders(theme),
    [`&.${matrixClasses.rowHeaderButton}`]: {
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
        "&:active": { backgroundColor: theme.palette.action.hover },
        "&:focus-visible": {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2,
        },
    },
}));
/**
 * The grid never suspends, and the one text the row header translates is only
 * heard: while the translations load it uses the English default, then
 * re-renders
 */
const TRANSLATION_OPTIONS = { i18n: ccI18n, useSuspense: false };
/**
 * The sticky first cell of a data row, with what renderRowHeader renders.
 *
 * In touch mode with onRowHeaderActions set, the whole cell is one button:
 * named by the row's label (by what the header renders without one), and
 * described by what it does and then by what the header renders, so a label
 * does not hide the rest of the header from assistive technology.
 * @remarks Memoized on the row object.
 */
const MatrixRowHeader = (props) => {
    const { row } = props;
    const { renderRowHeader, onRowHeaderActions, classes, touch } = useMatrixConfig();
    const { t } = useTranslation("translation", TRANSLATION_OPTIONS);
    const button = touch && !!onRowHeaderActions;
    const activate = useCallback(() => {
        onRowHeaderActions?.(row.key);
    }, [onRowHeaderActions, row.key]);
    // The tap target has to answer to a keyboard too: on touch it is the only
    // path to the row actions, since the header's own buttons are suppressed.
    const activation = useMatrixActivation(button ? activate : undefined, row.label);
    // touch tells the renderer to drop its own buttons, so it follows the tap
    // target, not the device: without onRowHeaderActions those buttons are the
    // only way to the row's actions
    const context = useMemo(() => ({ touch: button }), [button]);
    const content = useMemo(() => renderRowHeader(row, context), [renderRowHeader, row, context]);
    // The button says what it does in its description, not in its name: the
    // name is the header cell's name too, which a screen reader repeats for
    // every cell of the row. A label replaces the contents as the name, so
    // they follow in the description ("Opens the actions for this row. Eva
    // Sommer guest"); without one they are the name already.
    const id = useId();
    const hintId = `${id}-hint`;
    const contentId = `${id}-content`;
    const describedBy = activation
        ? activation["aria-label"]
            ? `${hintId} ${contentId}`
            : hintId
        : undefined;
    // The row's header cell is a wrapper of its own: on touch the header is a
    // button, which cannot be the header cell too. Always there, so the
    // contents do not remount when the header becomes a button or stops being
    // one; so is the wrapper that lets the description point at them.
    return (_jsx(MatrixContents, { role: "rowheader", children: _jsxs(MatrixRowHeaderRoot, { className: combineClassNames([
                classes?.rowHeader,
                button && matrixClasses.rowHeaderButton,
            ]), ...activation, "aria-describedby": describedBy, children: [_jsx(MatrixContents, { id: contentId, children: content }), activation && (_jsx("span", { id: hintId, hidden: true, children: t("standalone.matrix.row-header-actions", {
                        defaultValue: "Opens the actions for this row.",
                    }) }))] }) }));
};
export default React.memo(MatrixRowHeader);
