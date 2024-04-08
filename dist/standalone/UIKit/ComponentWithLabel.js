import React from "react";
import { FormControlLabel, styled, Typography, useThemeProps, } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const StyledFormControlLabel = styled(FormControlLabel, {
    name: "CcComponentWithLabel",
    slot: "root",
})({});
const Label = styled(Typography, {
    name: "CcComponentWithLabel",
    slot: "label",
})({
    whiteSpace: "pre",
});
const ComponentWithLabel = (inProps) => {
    let props = useThemeProps({ props: inProps, name: "CcComponentWithLabel" });
    let label;
    if ("labelText" in props) {
        let { 
        // eslint-disable-next-line prefer-const
        labelText, labelVariant, labelDisplay, labelAlign, 
        // eslint-disable-next-line prefer-const
        ...propsCopy } = props;
        const labelPlacement = props.labelPlacement || "end";
        labelVariant = labelVariant ?? "caption";
        labelDisplay = labelDisplay ?? "block";
        labelAlign =
            labelAlign ??
                {
                    start: "right",
                    end: "left",
                    top: "center",
                    bottom: "center",
                }[labelPlacement];
        label = (React.createElement(Label, { variant: labelVariant, display: labelDisplay, align: labelAlign, className: propsCopy.classes?.label }, labelText));
        props = { ...propsCopy, label: "" };
    }
    else {
        label = props.label;
    }
    return (React.createElement(StyledFormControlLabel, { ...props, className: combineClassNames([props.className, props.classes?.root]), label: label }));
};
export default React.memo(ComponentWithLabel);
