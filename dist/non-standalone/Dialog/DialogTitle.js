import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DialogTitle as MuiDialogTitle, dialogContentClasses, IconButton, styled, useThemeProps, } from "@mui/material";
import { Close } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
const Root = styled("div", { name: "CcDialogTitle", slot: "root" })(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    // the width the title keeps beside an action
    "--cc-dialog-title-text-min-width": "0px",
    // the box of MUI's DialogTitle
    flex: "0 0 auto",
    padding: "16px 24px",
    // MUI's DialogContent drops its top padding right after a DialogTitle;
    // the heading sits inside this row, so the row carries that rule
    [`& + .${dialogContentClasses.root}:not(.${dialogContentClasses.dividers})`]: {
        paddingTop: 0,
    },
    // an action that doesn't fit beside the title moves below it, with the
    // close button, at the end of the row
    "&.CcDialogTitle-withAction:not(.CcDialogTitle-noTitle)": {
        flexWrap: "wrap",
        justifyContent: "flex-end",
        "--cc-dialog-title-text-min-width": "7rem",
    },
    "&.CcDialogTitle-noTitle": {
        padding: theme.spacing(1),
        position: "absolute",
        right: 0,
    },
}));
const TextWrapper = styled("div", {
    name: "CcDialogTitle",
    slot: "textWrapper",
})({
    flex: "1 1 0",
    // a min-width rather than a basis: a dialog sized to its content counts it
    minWidth: "var(--cc-dialog-title-text-min-width)",
});
// MUI's DialogTitle: the h2 that MUI's Dialog is labelled by. A long title
// wraps, as MUI's does; a word wider than the dialog (a German compound on a
// phone) breaks too, also inside a flex row an app passes as the title
const Text = styled(MuiDialogTitle, { name: "CcDialogTitle", slot: "text" })({
    padding: 0,
    overflowWrap: "anywhere",
});
const CloseButton = styled(IconButton, {
    name: "CcDialogTitle",
    slot: "closeButton",
})(({ theme }) => ({
    color: theme.palette.grey[500],
    padding: `calc(${theme.spacing(1)} / 2)`,
    zIndex: 1,
}));
// the action and the close button, which stays beside it when the action
// moves below the title or wraps
const Controls = styled("div", { name: "CcDialogTitle", slot: "controls" })({
    display: "flex",
    alignItems: "center",
    flex: "0 1 auto",
    minWidth: 0,
});
const Action = styled("div", { name: "CcDialogTitle", slot: "action" })({
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    alignItems: "center",
    flex: "0 1 auto",
    minWidth: 0,
});
const DialogTitleRaw = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcDialogTitle" });
    const { id, children, onClose, action, noTitle, className, classes } = props;
    const { t } = useCCTranslations();
    return (_jsxs(Root, { className: combineClassNames([
            className,
            classes?.root,
            noTitle && "CcDialogTitle-noTitle",
            !!action && "CcDialogTitle-withAction",
        ]), children: [_jsx(TextWrapper, { className: classes?.textWrapper, children: noTitle ? (children) : (_jsx(Text, { id: id, className: classes?.text, children: children })) }), (action || onClose) && (_jsxs(Controls, { className: classes?.controls, children: [action && _jsx(Action, { className: classes?.action, children: action }), onClose && (_jsx(CloseButton, { "aria-label": t("non-standalone.dialog.dialog-title.close"), className: classes?.closeButton, onClick: onClose, size: "large", children: _jsx(Close, {}) }))] }))] }));
};
/**
 * Title row for an MUI `Dialog`: a heading with the title, optional controls
 * (`action`) and an optional close (X) button next to it. Place it inside the
 * `Dialog`: the heading is MUI's `DialogTitle`, so it names the dialog, and
 * the controls and the close button are not part of that name. With `noTitle`
 * there is no heading, only the controls and the close button, and the dialog
 * needs a name from elsewhere.
 * Theme: `CcDialogTitle` (slots `root`, `textWrapper`, `text`, `controls`,
 * `action`, `closeButton`).
 */
export const DialogTitle = React.memo(DialogTitleRaw);
