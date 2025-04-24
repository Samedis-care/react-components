import React from "react";
import { DialogTitle as MuiDialogTitle, Grid2 as Grid, IconButton, styled, Typography, useThemeProps, } from "@mui/material";
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
})({
    maxWidth: "75%",
});
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
    return (React.createElement(Root, { id: id, className: combineClassNames([
            className,
            classes?.root,
            noTitle && "CcDialogTitle-noTitle",
        ]) },
        React.createElement(Grid, { container: true, wrap: "nowrap" },
            React.createElement(TextWrapper, { className: classes?.textWrapper },
                React.createElement(Text, { variant: "h6", noWrap: true, className: classes?.text }, children)),
            React.createElement(Grid, { size: "grow" }),
            onClose && (React.createElement(Grid, null,
                React.createElement(CloseButton, { "aria-label": t("non-standalone.dialog.dialog-title.close"), className: classes?.closeButton, onClick: onClose, size: "large" },
                    React.createElement(Close, null)))))));
};
export const DialogTitle = React.memo(DialogTitleRaw);
