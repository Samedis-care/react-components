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
        borderColor: theme.palette.divider,
        borderRadius: "2px",
        backgroundColor: theme.palette.background.paper,
    },
}));
const _uncheckedIcon = (_jsx(SvgIcon, { viewBox: "-3.5 -4.5 24 24", children: _jsx("polyline", { id: "check", fill: "transparent", stroke: "transparent", strokeWidth: "3.5", points: "1 7 6 12 16.5 1.5" }) }));
const _checkedIcon = (_jsx(SvgIcon, { viewBox: "-3.5 -4.5 24 24", children: _jsx("polyline", { id: "check", fill: "transparent", stroke: "currentColor", strokeWidth: "3.5", points: "1 7 6 12 16.5 1.5" }) }));
const Checkbox = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcCheckbox" });
    return (_jsx(StyledCheckbox, { color: "primary", icon: _uncheckedIcon, checkedIcon: _checkedIcon, ...props }));
};
export default React.memo(Checkbox);
