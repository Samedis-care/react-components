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
import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import combineClassNames from "../../../utils/combineClassNames";
var ScheduleFilterRenderer = function (props) {
    var type = props.type;
    if (type === "select")
        return (React.createElement(ScheduleFilterRendererSelect, __assign({}, props)));
    if (type === "checkbox")
        return (React.createElement(ScheduleFilterRendererSwitch, __assign({}, props)));
    throw new Error("Invalid filter type: ".concat(type));
};
var useStyles = makeStyles(function (theme) { return ({
    filterSelect: {
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        width: "100%",
    },
    filterSelectInlineScrollable: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
}); }, { name: "CcScheduleFilterRenderers" });
var ScheduleFilterRendererSelect = function (props) {
    var classes = useStyles();
    return (React.createElement("select", { className: combineClassNames([
            classes.filterSelect,
            props.inline === "scrollable" && classes.filterSelectInlineScrollable,
        ]), value: props.value, name: props.name, onChange: props.onChange }, Object.entries(props.options).map(function (_a) {
        var value = _a[0], label = _a[1];
        return (React.createElement("option", { value: value, key: value }, label));
    })));
};
var ScheduleFilterRendererSwitch = function (props) {
    var id = useState(Math.random().toString().substring(2))[0];
    return (React.createElement(React.Fragment, null,
        React.createElement("input", { type: "checkbox", id: id, name: props.name, checked: props.value, onChange: props.onChange }),
        React.createElement("label", { htmlFor: id }, props.label)));
};
export default React.memo(ScheduleFilterRenderer);
