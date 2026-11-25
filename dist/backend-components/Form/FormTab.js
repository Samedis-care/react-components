import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useId } from "react";
import { styled, Tab, tabClasses } from "@mui/material";
import { ErrorOutlined as ErrorIcon } from "@mui/icons-material";
import { FormContext } from "./Form";
import { DirtyStateContext } from "./DirtyStateContext";
import { DirtyMarker } from "../../standalone/UIKit/MuiFieldState";
import useCCTranslations from "../../utils/useCCTranslations";
/**
 * The label with its markers. A span, because MUI's Tab lays its label out as
 * a column: the markers belong beside the text, not under it.
 */
const Label = styled("span", { name: "CcFormTab", slot: "label" })({
    display: "inline-flex",
    alignItems: "center",
    maxWidth: "100%",
});
/**
 * A Tab on a colored bar (`textColor="inherit"`, e.g. in an AppBar): the
 * markers take the tab's text color, which contrasts with the bar where the
 * palette's info and error colors need not. The markers still differ in shape.
 */
const ON_COLORED_BAR = `.${tabClasses.textColorInherit} &`;
/**
 * The library's modified marker (`CcDirtyMarker`), as on the fields. Forced
 * colors would paint its background in the canvas color, which hides the dot,
 * so there it is drawn in the text color.
 */
const TabDirtyMarker = styled(DirtyMarker, {
    name: "CcFormTab",
    slot: "dirtyMarker",
})({
    flexShrink: 0,
    [ON_COLORED_BAR]: { backgroundColor: "currentColor" },
    "@media (forced-colors: active)": {
        forcedColorAdjust: "none",
        backgroundColor: "CanvasText",
    },
});
const StyledErrorIcon = styled(ErrorIcon, {
    name: "CcFormTab",
    slot: "errorIcon",
})(({ theme }) => ({
    flexShrink: 0,
    marginInlineStart: 4,
    fontSize: theme.typography.pxToRem(18),
    color: theme.palette.error.main,
    [ON_COLORED_BAR]: { color: "inherit" },
}));
/**
 * Whether one of the fields is marked modified
 * @param marks The marks of the DirtyStateContext
 * @param fields The fields
 */
const anyMarked = (marks, fields) => !!fields && fields.some((field) => marks[field]);
/**
 * Whether one of the fields shows a validation error: touched, with an error
 * (the same rule as a `FormField`)
 * @param errors The Form's errors
 * @param touched The Form's touched state
 * @param fields The fields
 */
const anyShowsError = (errors, touched, fields) => !!fields && fields.some((field) => !!(touched[field] && errors[field]));
/**
 * A MUI `Tab` for a tabbed form, which marks its label when a field on the tab
 * is modified or invalid, also while the tab's panel is not shown: the
 * library's modified marker (the dot after a modified field's label) and an
 * error icon (`palette.error.main`). Use it in place of `Tab` in `RoutedTabs`
 * or any MUI `Tabs` inside a Form, and list the fields of each tab:
 *
 * ```tsx
 * <RoutedTabs aria-label={t("tabs.label")}>
 *   <FormTab value="" label={t("tabs.contract")} fields={CONTRACT_FIELDS} />
 *   <FormTab value="conditions" label={t("tabs.conditions")} fields={CONDITION_FIELDS} />
 * </RoutedTabs>
 * ```
 *
 * - What a marker means is read out too: the tab's accessible description
 *   (`aria-describedby`, after one of its own) says "Contains invalid fields."
 *   and "Contains modified fields." while the markers show. The accessible name
 *   stays the label.
 * - Every other prop goes to MUI's `Tab`, and so does the ref.
 * - On a colored bar (`textColor="inherit"`, e.g. in an AppBar) both markers
 *   take the tab's text color, as the palette's colors need not contrast with
 *   the bar; they still differ in shape.
 * - Style the parts with `theme.components.CcFormTab.styleOverrides`: `label`
 *   (the label with its markers), `dirtyMarker` and `errorIcon`. The modified
 *   marker is the `CcDirtyMarker` element of the fields as well, so a theme
 *   that restyles that one restyles the tab's.
 * @param props The props
 * @param ref The ref of MUI's Tab
 */
const FormTab = (props, ref) => {
    const { fields, dirty: dirtyProp, error: errorProp, label, "aria-describedby": describedByProp, ...tabProps } = props;
    const { t } = useCCTranslations();
    const formContext = useContext(FormContext);
    const marks = useContext(DirtyStateContext);
    const id = useId();
    const dirty = !!dirtyProp || anyMarked(marks, fields);
    const error = !!errorProp ||
        (!!formContext &&
            anyShowsError(formContext.errors, formContext.touched, fields));
    const errorId = `${id}-invalid`;
    const dirtyId = `${id}-modified`;
    const describedBy = [describedByProp, error && errorId, dirty && dirtyId]
        .filter(Boolean)
        .join(" ") || undefined;
    // a Tab without a label (an icon only) keeps it that way while unmarked: MUI
    // lays out a Tab with an icon and a label differently
    const unlabelled = (label === undefined || label === null) && !dirty && !error;
    return (_jsx(Tab, { ...tabProps, ref: ref, "aria-describedby": describedBy, label: unlabelled ? (label) : (_jsxs(Label, { children: [label, dirty && _jsx(TabDirtyMarker, { text: false }), error && _jsx(StyledErrorIcon, { "aria-hidden": "true" }), error && (_jsx("span", { id: errorId, hidden: true, children: t("backend-components.form.tab.invalid") })), dirty && (_jsx("span", { id: dirtyId, hidden: true, children: t("backend-components.form.tab.modified") }))] })) }));
};
export default React.memo(React.forwardRef(FormTab));
