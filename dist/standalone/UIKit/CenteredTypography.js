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
import makeStyles from "@mui/styles/makeStyles";
import { Typography } from "@mui/material";
var useStyles = makeStyles({
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
var CenteredTypography = function (props) {
    var _a;
    var classes = useStyles(props);
    return (React.createElement("div", { className: classes.outerWrapper },
        React.createElement("div", { className: classes.innerWrapper },
            React.createElement(Typography, __assign({}, props, { classes: (_a = props.subClasses) === null || _a === void 0 ? void 0 : _a.typography })))));
};
export default React.memo(CenteredTypography);
