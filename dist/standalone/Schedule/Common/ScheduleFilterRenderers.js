import React, { useState } from "react";
import { styled } from "@mui/material";
import combineClassNames from "../../../utils/combineClassNames";
const ScheduleFilterRenderer = (props) => {
    const type = props.type;
    if (type === "select")
        return (React.createElement(ScheduleFilterRendererSelect, { ...props }));
    if (type === "checkbox")
        return (React.createElement(ScheduleFilterRendererSwitch, { ...props }));
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
    return (React.createElement(StyledSelect, { value: props.value, name: props.name, onChange: props.onChange, className: combineClassNames([
            props.inline === "scrollable" && "Cc-scrollable",
        ]) }, Object.entries(props.options).map(([value, label]) => (React.createElement("option", { value: value, key: value }, label)))));
};
const ScheduleFilterRendererSwitch = (props) => {
    const [id] = useState(Math.random().toString().substring(2));
    return (React.createElement(React.Fragment, null,
        React.createElement("input", { type: "checkbox", id: id, name: props.name, checked: props.value, onChange: props.onChange }),
        React.createElement("label", { htmlFor: id }, props.label)));
};
export default React.memo(ScheduleFilterRenderer);
