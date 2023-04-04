import React from "react";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import { Close } from "@material-ui/icons";
import { Grid, IconButton, Typography } from "@material-ui/core";
import { combineClassNames } from "../../utils";
var useClasses = makeStyles(function (theme) { return ({
    noTitle: {
        padding: theme.spacing(1),
        position: "absolute",
        right: 0,
    },
    closeButton: {
        color: theme.palette.grey[500],
        padding: theme.spacing(1) / 2,
        zIndex: 1,
    },
    text: {
        textOverflow: "ellipsis",
        overflow: "hidden",
    },
    textWrapper: {
        maxWidth: "75%",
    },
}); }, { name: "CcDialogTitle" });
var DialogTitleRaw = function (props) {
    var id = props.id, children = props.children, onClose = props.onClose, noTitle = props.noTitle;
    var classes = useClasses();
    return (React.createElement(MuiDialogTitle, { id: id, disableTypography: true, className: combineClassNames([noTitle && classes.noTitle]) },
        React.createElement(Grid, { container: true, wrap: "nowrap" },
            React.createElement(Grid, { item: true, className: classes.textWrapper },
                React.createElement(Typography, { variant: "h6", noWrap: true, className: classes.text }, children)),
            React.createElement(Grid, { item: true, xs: true }),
            onClose && (React.createElement(Grid, { item: true },
                React.createElement(IconButton, { "aria-label": "Close", className: classes.closeButton, onClick: onClose },
                    React.createElement(Close, null)))))));
};
export var DialogTitle = React.memo(DialogTitleRaw);
