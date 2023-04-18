import React from "react";
import { Button, Grid } from "@mui/material";
import { combineClassNames } from "../../../utils";
import makeStyles from "@mui/styles/makeStyles";
var useStyles = makeStyles({
    btn: {
        textTransform: "none",
        textAlign: "left",
        color: "inherit",
        display: "block",
    },
    btnDisabled: {
        cursor: "default",
    },
}, { name: "CcDayContents" });
var DayContents = function (props) {
    var data = props.data;
    var classes = useStyles();
    return (React.createElement(Grid, { container: true, spacing: 2 }, data.map(function (entry) { return (React.createElement(Grid, { item: true, xs: 12, key: entry.id },
        React.createElement(Button, { variant: "outlined", size: "small", fullWidth: true, className: combineClassNames([
                classes.btn,
                !entry.onClick && !entry.onAuxClick && classes.btnDisabled,
            ]), onClick: entry.onClick, onAuxClick: entry.onAuxClick, disableRipple: !entry.onClick && !entry.onAuxClick }, entry.title))); })));
};
export default React.memo(DayContents);
