import React, { useCallback } from "react";
import { Grid, Typography, Switch } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import makeStyles from "@mui/styles/makeStyles";
import cleanClassMap from "../../utils/cleanClassMap";
const useStyles = makeStyles({
    switch: {
        lineHeight: "30px",
        float: "right",
    },
    labelWithSwitch: {
        marginTop: 15,
    },
}, { name: "CcInlineSwitch" });
const AntSwitch = withStyles((theme) => ({
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
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.common.white,
    },
    checked: {},
}))(Switch);
const InlineSwitch = (props) => {
    const classes = useStyles(cleanClassMap(props, false, "switch", "labelWithSwitch"));
    const { label, value, onChange, visible, children } = props;
    const handleSwitchChange = useCallback((event) => {
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
