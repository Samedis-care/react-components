import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { Checkbox as MuiCheckbox, styled, SvgIcon, useThemeProps, } from "@mui/material";
const StyledCheckbox = styled(MuiCheckbox, {
    name: "CcCheckbox",
    slot: "root",
})(({ theme }) => ({
    "& > svg": {
        borderWidth: "1px",
        borderStyle: "solid",
        // the colour of MUI's input underline: the least contrast (3:1) a
        // control's boundary needs against a white paper
        borderColor: theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.7)"
            : "rgba(0, 0, 0, 0.42)",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: theme.palette.background.paper,
    },
    "&.Mui-disabled > svg": {
        borderColor: theme.palette.action.disabled,
    },
}));
const _uncheckedIcon = (_jsx(SvgIcon, { viewBox: "-3.5 -4.5 24 24", children: _jsx("polyline", { id: "check", fill: "transparent", stroke: "transparent", strokeWidth: "3.5", points: "1 7 6 12 16.5 1.5" }) }));
const _checkedIcon = (_jsx(SvgIcon, { viewBox: "-3.5 -4.5 24 24", children: _jsx("polyline", { id: "check", fill: "transparent", stroke: "currentColor", strokeWidth: "3.5", points: "1 7 6 12 16.5 1.5" }) }));
const Checkbox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcCheckbox" });
    return (_jsx(StyledCheckbox, { color: "primary", icon: _uncheckedIcon, checkedIcon: _checkedIcon, ...props }));
};
export default React.memo(Checkbox);
