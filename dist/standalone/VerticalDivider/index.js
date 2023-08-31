import React from "react";
import makeStyles from "@mui/styles/makeStyles";
const useStyles = makeStyles((theme) => ({
    root: {
        display: "inline-block",
        borderRight: `1px solid ${theme.palette.divider}`,
        height: "100%",
        padding: "0",
        margin: "0 4px",
    },
}), { name: "CcVerticalDivider" });
const VerticalDivider = (props) => {
    const classes = useStyles(props);
    return React.createElement("div", { className: classes.root });
};
export default React.memo(VerticalDivider);
