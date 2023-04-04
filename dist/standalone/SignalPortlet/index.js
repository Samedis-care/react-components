var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
import SignalPortletItem from "./SignalPortletItem";
import { makeStyles } from "@material-ui/core/styles";
import { Divider, Grid, List, Paper, Typography } from "@material-ui/core";
var useStyles = makeStyles({
    paper: {
        height: "100%",
    },
    list: {},
    title: {},
    titleWrapper: {},
}, { name: "CcSignalPortlet" });
var SignalPortlet = function (props) {
    var classes = useStyles(props);
    return (React.createElement(Paper, { className: classes.paper },
        React.createElement(Grid, { container: true, spacing: 1 },
            React.createElement(Grid, { item: true, xs: 12, className: classes.titleWrapper },
                React.createElement(Typography, { variant: "h5", align: "center", className: classes.title }, props.title)),
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(Divider, null)),
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(List, { className: classes.list }, props.items.map(function (item, index) { return (React.createElement(SignalPortletItem, __assign({ key: index.toString(), colorPresent: props.colorPresent, colorNotPresent: props.colorNotPresent }, item))); }))))));
};
export default React.memo(SignalPortlet);
