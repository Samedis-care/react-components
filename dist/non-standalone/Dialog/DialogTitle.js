import React from "react";
import { DialogTitle as MuiDialogTitle } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Close } from "@mui/icons-material";
import { Grid, IconButton, Typography } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const useClasses = makeStyles((theme) => ({
    noTitle: {
        padding: theme.spacing(1),
        position: "absolute",
        right: 0,
    },
    closeButton: {
        color: theme.palette.grey[500],
        padding: `calc(${theme.spacing(1)} / 2)`,
        zIndex: 1,
    },
    text: {
        textOverflow: "ellipsis",
        overflow: "hidden",
    },
    textWrapper: {
        maxWidth: "75%",
    },
}), { name: "CcDialogTitle" });
const DialogTitleRaw = (props) => {
    const { id, children, onClose, noTitle } = props;
    const classes = useClasses();
    return (React.createElement(MuiDialogTitle, { id: id, className: combineClassNames([noTitle && classes.noTitle]) },
        React.createElement(Grid, { container: true, wrap: "nowrap" },
            React.createElement(Grid, { item: true, className: classes.textWrapper },
                React.createElement(Typography, { variant: "h6", noWrap: true, className: classes.text }, children)),
            React.createElement(Grid, { item: true, xs: true }),
            onClose && (React.createElement(Grid, { item: true },
                React.createElement(IconButton, { "aria-label": "Close", className: classes.closeButton, onClick: onClose, size: "large" },
                    React.createElement(Close, null)))))));
};
export const DialogTitle = React.memo(DialogTitleRaw);
