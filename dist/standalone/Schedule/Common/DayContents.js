import React from "react";
import { Button, Grid } from "@mui/material";
import { combineClassNames } from "../../../utils";
import makeStyles from "@mui/styles/makeStyles";
import combineColors from "../../../utils/combineColors";
const useStyles = makeStyles((theme) => ({
    btn: {
        textTransform: "none",
        textAlign: "left",
        color: "inherit",
        display: "block",
    },
    btnAltBorder: {
        borderColor: `rgba(${combineColors(theme.palette.background.paper, theme.palette.action.hover).join()})`,
        "&:hover": {
            borderColor: theme.palette.background.paper,
        },
    },
    btnDisabled: {
        cursor: "default",
    },
}), { name: "CcDayContents" });
const DayContents = (props) => {
    const { data, altBorder } = props;
    const classes = useStyles();
    return (React.createElement(Grid, { container: true, spacing: 2 }, data.map((entry) => (React.createElement(Grid, { item: true, xs: 12, key: entry.id },
        React.createElement(Button, { variant: "outlined", size: "small", fullWidth: true, className: combineClassNames([
                classes.btn,
                altBorder && classes.btnAltBorder,
                !entry.onClick && !entry.onAuxClick && classes.btnDisabled,
            ]), onClick: entry.onClick, onAuxClick: entry.onAuxClick, disableRipple: !entry.onClick && !entry.onAuxClick }, entry.title))))));
};
export default React.memo(DayContents);
