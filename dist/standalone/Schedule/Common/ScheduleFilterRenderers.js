import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
const ScheduleFilterRenderer = (props) => {
    const type = props.type;
    if (type === "select")
        return (_jsx(ScheduleFilterRendererSelect, { ...props }));
    if (type === "checkbox")
        return (_jsx(ScheduleFilterRendererSwitch, { ...props }));
    throw new Error(`Invalid filter type: ${type}`);
};
const StyledSelect = styled("select", {
    name: "CcScheduleFilterRendererSelect",
    slot: "root",
})(({ theme }) => ({
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    width: "100%",
    "&.Cc-scrollable": {
        color: theme.palette.primary.contrastText,
    },
}));
const ScheduleFilterRendererSelect = (props) => {
    return (_jsx(StyledSelect, { value: props.value, name: props.name, onChange: props.onChange, className: combineClassNames([
            props.inline === "scrollable" && "Cc-scrollable",
        ]), children: Object.entries(props.options).map(([value, label]) => (_jsx("option", { value: value, children: label }, value))) }));
};
const ScheduleFilterRendererSwitch = (props) => {
    const [id] = useState(Math.random().toString().substring(2));
    return (_jsxs(_Fragment, { children: [_jsx("input", { type: "checkbox", id: id, name: props.name, checked: props.value, onChange: props.onChange }), _jsx("label", { htmlFor: id, children: props.label })] }));
};
export default React.memo(ScheduleFilterRenderer);
