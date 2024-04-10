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
    return (React.createElement(Grid, { container: true, spacing: 2, className: className }, data.map((entry) => (React.createElement(Grid, { item: true, xs: 12, key: entry.id },
        React.createElement(StyledButton, { variant: "outlined", size: "small", fullWidth: true, ownerState: {
                altBorder: !!altBorder,
                unClickable: !entry.onClick && !entry.onAuxClick,
            }, className: classes?.button, onClick: entry.onClick, onAuxClick: entry.onAuxClick, disableRipple: !entry.onClick && !entry.onAuxClick }, entry.title))))));
};
export default React.memo(DayContents);
