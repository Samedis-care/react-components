import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DialogTitle as MuiDialogTitle, dialogContentClasses, IconButton, styled, useThemeProps, } from "@mui/material";
import { Close } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
const Root = styled("div", { name: "CcDialogTitle", slot: "root" })(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    // the box of MUI's DialogTitle
    flex: "0 0 auto",
    padding: "16px 24px",
    // MUI's DialogContent drops its top padding right after a DialogTitle;
    // the heading sits inside this row, so the row carries that rule
    [`& + .${dialogContentClasses.root}:not(.${dialogContentClasses.dividers})`]: {
        paddingTop: 0,
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
    minWidth: 0,
});
// MUI's DialogTitle: the h2 that MUI's Dialog is labelled by
const Text = styled(MuiDialogTitle, { name: "CcDialogTitle", slot: "text" })({
    padding: 0,
    textOverflow: "ellipsis",
    overflow: "hidden",
});
const CloseButton = styled(IconButton, {
    name: "CcDialogTitle",
    slot: "closeButton",
})(({ theme }) => ({
    color: theme.palette.grey[500],
    padding: `calc(${theme.spacing(1)} / 2)`,
    zIndex: 1,
}));
const DialogTitleRaw = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcDialogTitle" });
    const { id, children, onClose, noTitle, className, classes } = props;
    const { t } = useCCTranslations();
    return (_jsxs(Root, { className: combineClassNames([
            className,
            classes?.root,
            noTitle && "CcDialogTitle-noTitle",
        ]), children: [_jsx(TextWrapper, { className: classes?.textWrapper, children: _jsx(Text, { id: id, noWrap: true, className: classes?.text, children: children }) }), onClose && (_jsx(CloseButton, { "aria-label": t("non-standalone.dialog.dialog-title.close"), className: classes?.closeButton, onClick: onClose, size: "large", children: _jsx(Close, {}) }))] }));
};
/**
 * Title row for an MUI `Dialog`: a heading with the title and an optional
 * close (X) button next to it. Place it inside the `Dialog`: the heading is
 * MUI's `DialogTitle`, so it names the dialog, and the close button is not
 * part of that name.
 * Theme: `CcDialogTitle` (slots `root`, `textWrapper`, `text`, `closeButton`).
 */
export const DialogTitle = React.memo(DialogTitleRaw);
