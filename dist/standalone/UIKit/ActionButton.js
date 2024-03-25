import React from "react";
import { Box, Button, Tooltip, styled, useThemeProps, } from "@mui/material";
import combineColors from "../../utils/combineColors";
const StyledButton = styled(Button, {
    name: "CcActionButton",
    slot: "button",
})(({ theme, ownerState: { small, color }, }) => {
    return {
        backgroundColor: color ? undefined : theme.palette.primary.main,
        color: color ? undefined : theme.palette.primary.contrastText,
        textTransform: "unset",
        justifyContent: "flex-start",
        "&:hover": {
            backgroundColor: color
                ? undefined
                : `rgba(${combineColors(theme.palette.primary.main, theme.palette.action.hover).join()})`,
        },
        "&:.Mui-disabled": {
            backgroundColor: theme.palette.action.disabled,
        },
        minWidth: small ? 0 : undefined,
        paddingLeft: small ? theme.spacing(3) : undefined,
        paddingRight: small ? theme.spacing(3) : undefined,
        "& .MuiButton-startIcon": {
            margin: small ? 0 : undefined,
        },
        "& .MuiButton-outlined": {
            borderRadius: theme.shape.borderRadius,
            "&.Mui-disabled": {
                color: theme.palette.background.paper,
            },
            paddingLeft: small ? theme.spacing(3) : undefined,
            paddingRight: small ? theme.spacing(3) : undefined,
        },
        "& .MuiButton-contained": {
            borderRadius: theme.shape.borderRadius,
            "&.Mui-disabled": {
                color: theme.palette.background.paper,
            },
            paddingLeft: small ? theme.spacing(3) : undefined,
            paddingRight: small ? theme.spacing(3) : undefined,
        },
        "& .MuiButton-label": {
            padding: 0,
            justifyContent: small ? "center" : "flex-start",
        },
    };
});
const ActionButton = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcActionButton" });
    const { icon, fullWidth, small, children, ...otherProps } = props;
    const renderButton = () => (React.createElement(StyledButton, { variant: "contained", disableElevation: true, fullWidth: fullWidth ?? !small, startIcon: icon, ownerState: { small: Boolean(small), color: Boolean(otherProps.color) }, ...otherProps }, !small && React.createElement(Box, null, children)));
    if (props.disabled || !small)
        return renderButton();
    return React.createElement(Tooltip, { title: React.createElement("span", null, children) }, renderButton());
};
export default React.memo(ActionButton);
