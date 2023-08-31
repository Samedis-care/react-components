import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
const useStyles = makeStyles({
    innerWrapper: {
        height: 70,
        left: "50%",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
    },
    outerWrapper: {
        height: "100%",
        position: "relative",
        width: "100%",
    },
}, { name: "CcCenteredTypography" });
const CenteredTypography = (props) => {
    const classes = useStyles(props);
    return (React.createElement("div", { className: classes.outerWrapper },
        React.createElement("div", { className: classes.innerWrapper },
            React.createElement(Typography, { ...props, classes: props.subClasses?.typography }))));
};
export default React.memo(CenteredTypography);
