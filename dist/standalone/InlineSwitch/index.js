import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Grid, styled, Switch, Typography, useThemeProps } from "@mui/material";
import combineClassNames from "../../utils/combineClassNames";
const AntSwitch = styled(Switch, { name: "CcInlineSwitch", slot: "switch" })(({ theme }) => ({
    width: 35,
    height: 16,
    padding: 0,
    display: "flex",
    // the track fills the root, so the focus ring around it lies outside the root
    overflow: "visible",
    "& .MuiSwitch-switchBase": {
        padding: 2,
        color: theme.palette.grey[500],
        // MUI widens the input past the thumb and lets the root clip it to the
        // track; the root no longer clips, so the input covers just the track
        "& .MuiSwitch-input": { left: 0, width: 35 },
        "&.Mui-checked": {
            transform: "translateX(18px)",
            color: theme.palette.common.white,
            "& .MuiSwitch-input": { left: -18 },
            "& + .MuiSwitch-track": {
                opacity: 1,
                backgroundColor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
            },
            // as faint as the unchecked track while disabled, like MUI's Switch
            "&.Mui-disabled + .MuiSwitch-track": {
                opacity: theme.palette.mode === "light" ? 0.12 : 0.2,
            },
        },
        // keyboard focus: with the theme's focusVisible MUI draws its own ring on
        // the track; otherwise this one (MUI's default shows only the focus ripple)
        ...(!theme.focusVisible && {
            "&.Mui-focusVisible + .MuiSwitch-track": {
                outline: `2px solid ${(theme.vars || theme).palette.primary.main}`,
                outlineOffset: 2,
            },
        }),
    },
    "& .MuiSwitch-thumb": {
        width: 12,
        height: 12,
        boxShadow: "none",
    },
    "& .MuiSwitch-track": {
        border: `1px solid ${theme.palette.grey[500]}`,
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor: theme.palette.common.white,
    },
}));
const StyledRoot = styled("div", { name: "CcInlineSwitch", slot: "root" })({
    marginTop: 15,
});
const StyledSwitchWrapper = styled(Typography, {
    name: "CcInlineSwitch",
    slot: "switchWrapper",
})(({ theme }) => ({
    lineHeight: "30px",
    float: "right",
    "&.CcInlineSwitch-disabled": {
        color: theme.palette.text.disabled,
    },
}));
const InlineSwitch = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcInlineSwitch" });
    const { label, value, onChange, visible, disabled, children, classes, className, } = props;
    const handleSwitchChange = useCallback((event) => {
        // a click event dispatched on the disabled input by a script can still reach React
        if (disabled)
            return;
        if (onChange)
            onChange(event.target.checked);
    }, [onChange, disabled]);
    return (_jsxs(StyledRoot, { className: combineClassNames([className, classes?.root]), children: [visible && (_jsx(StyledSwitchWrapper, { component: "div", className: combineClassNames([
                    classes?.switchWrapper,
                    disabled && "CcInlineSwitch-disabled",
                ]), variant: "caption", children: _jsxs(Grid, { component: "label", container: true, sx: { alignItems: "center" }, spacing: 1, children: [_jsx(Grid, { children: _jsx(AntSwitch, { checked: value, onChange: handleSwitchChange, disabled: disabled, 
                                // the focus ring shows focus; the ripple would pulse under it endlessly
                                disableFocusRipple: true }) }), _jsx(Grid, { children: label })] }) })), _jsx("div", { children: children })] }));
};
export default React.memo(InlineSwitch);
