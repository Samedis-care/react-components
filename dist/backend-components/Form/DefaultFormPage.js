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
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
var DefaultFormPage = function (props) {
    var children = props.children;
    return (React.createElement(BasicFormPage, __assign({}, props, { form: children, childrenProps: undefined }), DefaultFormPageButtons));
};
export default React.memo(DefaultFormPage);
