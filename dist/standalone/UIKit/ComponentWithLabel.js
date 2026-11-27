import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useEffect, useRef } from "react";
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
    // wraps at spaces where the caption has less room than its text needs;
    // keeps the line breaks of the text
    whiteSpace: "pre-line",
});
const ComponentWithLabel = (inProps) => {
    let props = useThemeProps({ props: inProps, name: "CcComponentWithLabel" });
    const { onClick } = props;
    // A click on the caption reaches the <label> twice: as itself, and as the
    // click the label's activation behavior then sends to its control, which
    // bubbles back up. onClick gets the first one only. The browser sends the
    // second click in the same task, but after the microtasks of the first
    // one's handlers have run, so the mark is dropped by a timeout.
    const forwardedClick = useRef(null);
    const forwardedClickTimeout = useRef(undefined);
    useEffect(() => () => window.clearTimeout(forwardedClickTimeout.current), []);
    const handleClick = useCallback((evt) => {
        const label = evt.currentTarget;
        const control = label.control;
        const forwarded = forwardedClick.current;
        if (forwarded && evt.target === control) {
            forwardedClick.current = null;
            if (forwarded.stopped)
                evt.stopPropagation();
            return;
        }
        onClick?.(evt);
        if (control &&
            label.contains(control) &&
            !control.contains(evt.target) &&
            !evt.isDefaultPrevented()) {
            // the label forwards this click to the control, unless a later
            // handler cancels it, the control is disabled or the click is on
            // other interactive content in the label
            forwardedClick.current = { stopped: evt.isPropagationStopped() };
            window.clearTimeout(forwardedClickTimeout.current);
            forwardedClickTimeout.current = window.setTimeout(() => {
                forwardedClick.current = null;
            });
        }
    }, [onClick]);
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
        label = (_jsx(Label, { variant: labelVariant, sx: { display: labelDisplay }, align: labelAlign, className: propsCopy.classes?.label, children: labelText }));
        props = { ...propsCopy, label: "" };
    }
    else {
        label = props.label;
    }
    return (_jsx(StyledFormControlLabel, { ...props, className: combineClassNames([props.className, props.classes?.root]), label: label, onClick: onClick && handleClick }));
};
export default React.memo(ComponentWithLabel);
