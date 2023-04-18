import React from "react";
import makeStyles from "@mui/styles/makeStyles";
import { CircularProgress, Typography } from "@mui/material";
var useStyles = makeStyles({
    innerProgressWrapper: {
        left: "50%",
        position: "absolute",
        top: "50%",
        transform: "translate(-50%, -50%)",
    },
    innerWrapper: {
        height: 70,
        left: "50%",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
    },
    outerProgressWrapper: {
        height: "100%",
        position: "relative",
        width: "100%",
    },
    outerWrapper: {
        height: "100%",
        position: "relative",
        width: "100%",
    },
}, { name: "CcLoader" });
var Loader = function (props) {
    var classes = useStyles(props);
    return (React.createElement("div", { className: classes.outerWrapper },
        React.createElement("div", { className: classes.innerWrapper },
            props.text && React.createElement(Typography, { variant: "h6" }, props.text),
            React.createElement("div", { className: classes.outerProgressWrapper },
                React.createElement("div", { className: classes.innerProgressWrapper },
                    React.createElement(CircularProgress, null))))));
};
export default React.memo(Loader);
