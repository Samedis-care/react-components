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
import { SvgIcon } from "@material-ui/core";
var SignIcon = function (props) { return (React.createElement(SvgIcon, __assign({}, props, { viewBox: "0 0 36 36", fill: "#1d1d1b" }),
    React.createElement("path", { d: "M35.16,6.26a52.79,52.79,0,0,1-3,10.26l-7.45,3.73h5.7a33.84,33.84,0,0,1-2.11,3.3L18,27h7.1a17,17,0,0,1-9.35,4,78.53,78.53,0,0,1-8.86.49l-4,4A1.65,1.65,0,0,1,1.69,36a1.67,1.67,0,0,1-1.2-.49A1.63,1.63,0,0,1,0,34.31a1.59,1.59,0,0,1,.49-1.19L18.77,14.91a1.28,1.28,0,0,0,.29-.81,1.17,1.17,0,0,0-.32-.81,1,1,0,0,0-.77-.35,1.11,1.11,0,0,0-.81.35L4.57,25.88q.13-3.16.42-5.63.78-7.87,8-13A38.82,38.82,0,0,1,26.72,1.48,52.78,52.78,0,0,1,36,0,56.86,56.86,0,0,1,35.16,6.26Z" }))); };
export default React.memo(SignIcon);
