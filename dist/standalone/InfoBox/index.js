import React, { useCallback } from "react";
import { ErrorOutlined, InfoOutlined, ReportProblemOutlined, } from "@material-ui/icons";
import { makeStyles, Accordion, AccordionSummary as MuiAccordionSummary, AccordionDetails, Typography, withStyles, } from "@material-ui/core";
import SuccessOutlinedIcon from "../Icons/SuccessOutlinedIcon";
import { combineClassNames } from "../../utils";
var AccordionSummary = withStyles({
    root: {
        minHeight: 48,
        "&$expanded": {
            minHeight: 48,
        },
    },
    content: {
        "&$expanded": {
            margin: "12px 0",
        },
    },
    expanded: {},
})(MuiAccordionSummary);
export var useStyles = makeStyles(function (theme) { return ({
    noShadow: {
        "box-shadow": "none",
    },
    rounded: {
        overflow: "hidden",
    },
    panelDetails: {
        border: "1px solid grey",
        borderRadius: "0px 0px ".concat(theme.shape.borderRadius, "px ").concat(theme.shape.borderRadius, "px"),
        padding: "8px 24px",
        whiteSpace: "pre-line",
    },
    root: {
        margin: 0,
        paddingLeft: theme.spacing(5),
    },
    alwaysExpanded: {
        cursor: "default",
        "&:hover:not(.Mui-disabled)": {
            cursor: "default",
        },
    },
    iconButton: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        alignItems: "center",
        justifyContent: "center",
        display: "flex",
        backgroundColor: "rgba(0,0,0,.2)",
        width: theme.spacing(6),
    },
    accordionPrimary: {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
    },
    accordionWarning: {
        backgroundColor: theme.palette.warning.main,
        borderColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText,
    },
    accordionSuccess: {
        backgroundColor: theme.palette.success.main,
        borderColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
    },
    accordionError: {
        backgroundColor: theme.palette.error.main,
        borderColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
    },
}); }, { name: "CcInfoBox" });
// .MuiAccordionSummary-content.Mui-expanded => margin => unset
// .MuiAccordionSummary-root.Mui-expanded => min-height => unset
var InfoBox = function (props) {
    var heading = props.heading, onChange = props.onChange, expanded = props.expanded, alwaysExpanded = props.alwaysExpanded, message = props.message, status = props.status;
    var classes = useStyles(props);
    var getIcon = useCallback(function () {
        switch (status) {
            case "warning":
                return React.createElement(ReportProblemOutlined, null);
            case "success":
                return React.createElement(SuccessOutlinedIcon, null);
            case "error":
                return React.createElement(ErrorOutlined, null);
            default:
                return React.createElement(InfoOutlined, null);
        }
    }, [status]);
    var getAccordionClass = useCallback(function () {
        switch (status) {
            case "warning":
                return classes.accordionWarning;
            case "success":
                return classes.accordionSuccess;
            case "error":
                return classes.accordionError;
            default:
                return classes.accordionPrimary;
        }
    }, [classes, status]);
    return (React.createElement(Accordion, { className: classes.noShadow, classes: { rounded: classes.rounded }, defaultExpanded: expanded, expanded: alwaysExpanded, onChange: onChange },
        React.createElement(AccordionSummary, { className: combineClassNames([
                getAccordionClass(),
                alwaysExpanded && classes.alwaysExpanded,
            ]) },
            React.createElement("div", { className: classes.root },
                React.createElement("span", { className: classes.iconButton }, getIcon()),
                React.createElement(Typography, { variant: "caption" }, heading))),
        React.createElement(AccordionDetails, { className: classes.panelDetails },
            React.createElement("div", null, message))));
};
export default React.memo(InfoBox);
