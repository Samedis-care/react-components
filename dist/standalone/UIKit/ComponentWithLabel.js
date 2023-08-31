import React from "react";
import { FormControlLabel, Typography, } from "@mui/material";
import { makeStyles } from "@mui/styles";
const useStyles = makeStyles((theme) => ({
    label: {
        whiteSpace: theme.componentsCare?.uiKit?.label?.whiteSpace || "pre",
        padding: theme.componentsCare?.uiKit?.label?.padding,
        margin: theme.componentsCare?.uiKit?.label?.margin,
        border: theme.componentsCare?.uiKit?.label?.border,
        borderRadius: theme.componentsCare?.uiKit?.label?.borderRadius,
        backgroundColor: theme.componentsCare?.uiKit?.label?.backgroundColor,
        color: theme.componentsCare?.uiKit?.label?.color,
        fontSize: theme.componentsCare?.uiKit?.label?.fontSize,
        fontWeight: theme.componentsCare?.uiKit?.label?.fontWeight,
        ...theme.componentsCare?.uiKit?.label?.style,
    },
}), { name: "CcComponentWithLabel" });
const ComponentWithLabel = (props) => {
    const classes = useStyles(props);
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
        label = (React.createElement(Typography, { variant: labelVariant, display: labelDisplay, align: labelAlign, className: classes.label }, labelText));
        props = { ...propsCopy, label: "" };
    }
    else {
        label = props.label;
    }
    return React.createElement(FormControlLabel, { ...props, label: label });
};
export default React.memo(ComponentWithLabel);
