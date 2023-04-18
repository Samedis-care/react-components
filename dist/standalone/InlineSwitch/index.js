import React, { useCallback } from "react";
import { Grid, Typography, Switch } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import makeStyles from "@mui/styles/makeStyles";
import { cleanClassMap } from "../../utils";
var useStyles = makeStyles({
    switch: {
        lineHeight: "30px",
        float: "right",
    },
    labelWithSwitch: {
        marginTop: 15,
    },
}, { name: "CcInlineSwitch" });
var AntSwitch = withStyles(function (theme) { return ({
    root: {
        width: 35,
        height: 16,
        padding: 0,
        display: "flex",
    },
    switchBase: {
        padding: 2,
        color: theme.palette.grey[500],
        "&$checked": {
            transform: "translateX(18px)",
            color: theme.palette.common.white,
            "& + $track": {
                opacity: 1,
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
            },
        },
    },
    thumb: {
        width: 12,
        height: 12,
        boxShadow: "none",
    },
    track: {
        border: "1px solid ".concat(theme.palette.grey[500]),
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.common.white,
    },
    checked: {},
}); })(Switch);
var InlineSwitch = function (props) {
    var classes = useStyles(cleanClassMap(props, false, "switch", "labelWithSwitch"));
    var label = props.label, value = props.value, onChange = props.onChange, visible = props.visible, children = props.children;
    var handleSwitchChange = useCallback(function (event) {
        if (onChange)
            onChange(event.target.checked);
    }, [onChange]);
    return (React.createElement(Typography, { component: "div", className: classes.labelWithSwitch },
        visible && (React.createElement(Typography, { component: "div", className: classes.switch, variant: "caption" },
            React.createElement(Grid, { component: "label", container: true, alignItems: "center", spacing: 1 },
                React.createElement(Grid, { item: true },
                    React.createElement(AntSwitch, { checked: value, onChange: handleSwitchChange })),
                React.createElement(Grid, { item: true }, label)))),
        React.createElement(Typography, { component: "div" }, children)));
};
export default React.memo(InlineSwitch);
