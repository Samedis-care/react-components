import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { Button, Grid, styled, useThemeProps } from "@mui/material";
import combineColors from "../../../utils/combineColors";
const StyledButton = styled(Button, { name: "CcDayContents", slot: "button" })(({ theme, ownerState: { altBorder, unClickable } }) => ({
    textTransform: "none",
    textAlign: "left",
    color: "inherit",
    display: "block",
    ...(altBorder && {
        borderColor: `rgba(${combineColors(theme.palette.background.paper, theme.palette.action.hover).join()})`,
        "&:hover": {
            borderColor: theme.palette.background.paper,
        },
    }),
    ...(unClickable && {
        cursor: "default",
    }),
}));
const DayContents = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcDayContents" });
    const { data, altBorder, className, classes } = props;
    return (_jsx(Grid, { container: true, spacing: 2, className: className, children: data.map((entry) => (_jsx(Grid, { size: 12, children: _jsx(StyledButton, { variant: "outlined", size: "small", fullWidth: true, ownerState: {
                    altBorder: !!altBorder,
                    unClickable: !entry.onClick && !entry.onAuxClick,
                }, className: classes?.button, onClick: entry.onClick, onAuxClick: entry.onAuxClick, disableRipple: !entry.onClick && !entry.onAuxClick, children: entry.title }) }, entry.id))) }));
};
export default React.memo(DayContents);
