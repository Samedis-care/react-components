import React from "react";
import SignalPortletItem from "./SignalPortletItem";
import makeStyles from "@mui/styles/makeStyles";
import { Divider, Grid, List, Paper, Typography } from "@mui/material";
import makeThemeStyles from "../../utils/makeThemeStyles";
const useStyles = makeStyles({
    paper: {
        height: "100%",
    },
    divider: {},
    list: {},
    title: {},
    titleWrapper: {},
}, { name: "CcSignalPortlet" });
const useThemeStyles = makeThemeStyles((theme) => theme.componentsCare?.signalPortlet?.root, "CcSignalPortlet", useStyles);
const SignalPortlet = (props) => {
    const classes = useThemeStyles(props);
    return (React.createElement(Paper, { className: classes.paper },
        React.createElement(Grid, { container: true, spacing: 1 },
            React.createElement(Grid, { item: true, xs: 12, className: classes.titleWrapper },
                React.createElement(Typography, { variant: "h5", align: "center", className: classes.title }, props.title)),
            React.createElement(Grid, { item: true, xs: 12, className: classes.divider },
                React.createElement(Divider, null)),
            React.createElement(Grid, { item: true, xs: 12 },
                React.createElement(List, { className: classes.list }, props.items.map((item, index) => (React.createElement(SignalPortletItem, { key: index.toString(), colorPresent: props.colorPresent, colorNotPresent: props.colorNotPresent, ...item }))))))));
};
export default React.memo(SignalPortlet);
