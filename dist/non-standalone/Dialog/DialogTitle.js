import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { DialogTitle as MuiDialogTitle, Grid, IconButton, styled, Typography, useThemeProps, } from "@mui/material";
import { Close } from "@mui/icons-material";
import combineClassNames from "../../utils/combineClassNames";
import useCCTranslations from "../../utils/useCCTranslations";
const Root = styled(MuiDialogTitle, { name: "CcDialogTitle", slot: "root" })(({ theme }) => ({
    "&.CcDialogTitle-noTitle": {
        padding: theme.spacing(1),
        position: "absolute",
        right: 0,
    },
}));
const TextWrapper = styled(Grid, {
    name: "CcDialogTitle",
    slot: "textWrapper",
})({});
const Text = styled(Typography, { name: "CcDialogTitle", slot: "text" })({
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
    return (_jsx(Root, { id: id, className: combineClassNames([
            className,
            classes?.root,
            noTitle && "CcDialogTitle-noTitle",
        ]), children: _jsxs(Grid, { container: true, wrap: "nowrap", sx: { justifyContent: "space-between", alignItems: "center" }, children: [_jsx(TextWrapper, { size: "grow", className: classes?.textWrapper, children: _jsx(Text, { variant: "h6", noWrap: true, className: classes?.text, children: children }) }), onClose && (_jsx(Grid, { children: _jsx(CloseButton, { "aria-label": t("non-standalone.dialog.dialog-title.close"), className: classes?.closeButton, onClick: onClose, size: "large", children: _jsx(Close, {}) }) }))] }) }));
};
export const DialogTitle = React.memo(DialogTitleRaw);
