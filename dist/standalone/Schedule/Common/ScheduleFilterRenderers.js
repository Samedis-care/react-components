import React, { useState } from "react";
import makeStyles from "@mui/styles/makeStyles";
import combineClassNames from "../../../utils/combineClassNames";
const ScheduleFilterRenderer = (props) => {
    const type = props.type;
    if (type === "select")
        return (React.createElement(ScheduleFilterRendererSelect, { ...props }));
    if (type === "checkbox")
        return (React.createElement(ScheduleFilterRendererSwitch, { ...props }));
    throw new Error(`Invalid filter type: ${type}`);
};
const useStyles = makeStyles((theme) => ({
    filterSelect: {
        border: "none",
        backgroundColor: "transparent",
        cursor: "pointer",
        width: "100%",
    },
    filterSelectInlineScrollable: {
        color: theme.palette.getContrastText(theme.palette.primary.main),
    },
}), { name: "CcScheduleFilterRenderers" });
const ScheduleFilterRendererSelect = (props) => {
    const classes = useStyles();
    return (React.createElement("select", { className: combineClassNames([
            classes.filterSelect,
            props.inline === "scrollable" && classes.filterSelectInlineScrollable,
        ]), value: props.value, name: props.name, onChange: props.onChange }, Object.entries(props.options).map(([value, label]) => (React.createElement("option", { value: value, key: value }, label)))));
};
const ScheduleFilterRendererSwitch = (props) => {
    const [id] = useState(Math.random().toString().substring(2));
    return (React.createElement(React.Fragment, null,
        React.createElement("input", { type: "checkbox", id: id, name: props.name, checked: props.value, onChange: props.onChange }),
        React.createElement("label", { htmlFor: id }, props.label)));
};
export default React.memo(ScheduleFilterRenderer);
