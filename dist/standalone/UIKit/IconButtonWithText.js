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
import { Grid, IconButton, Typography, } from "@material-ui/core";
var IconButtonWithText = function (props) { return (React.createElement(Grid, { container: true, direction: "column", alignItems: "center" },
    React.createElement(Grid, { item: true },
        React.createElement(IconButton, __assign({ onClick: props.onClick }, props.IconButtonProps), props.icon)),
    React.createElement(Grid, { item: true },
        React.createElement(Typography, __assign({ variant: "caption", color: "textSecondary", onClick: props.onClick }, props.TypographyProps), props.text)))); };
export default React.memo(IconButtonWithText);
