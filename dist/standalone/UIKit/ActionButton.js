import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import { withStyles } from "@mui/styles";
import combineColors from "../../utils/combineColors";
const StyledButton = withStyles((theme) => ({
    root: (props) => ({
        border: theme.componentsCare?.uiKit?.actionButton?.border,
        backgroundColor: props.color
            ? undefined
            : props.backgroundColor ||
                theme.componentsCare?.uiKit?.actionButton?.backgroundColor ||
                theme.palette.primary.main,
        color: props.textColor ||
            props.color ||
            theme.componentsCare?.uiKit?.actionButton?.color ||
            theme.palette.primary.contrastText,
        fontSize: theme.componentsCare?.uiKit?.actionButton?.fontSize,
        textTransform: "unset",
        justifyContent: "flex-start",
        "&:hover": {
            border: theme.componentsCare?.uiKit?.actionButton?.hover?.border ||
                theme.componentsCare?.uiKit?.actionButton?.border,
            backgroundColor: props.color
                ? undefined
                : `rgba(${combineColors(props.backgroundColor ||
                    theme.componentsCare?.uiKit?.actionButton?.backgroundColor ||
                    theme.palette.primary.main, theme.palette.action.hover).join()})`,
            ...{
                ...theme.componentsCare?.uiKit?.actionButton?.style,
                ...theme.componentsCare?.uiKit?.actionButton?.hover?.style,
            },
        },
        "&.Mui-disabled": {
            backgroundColor: theme.palette.action.disabled,
            ...{
                ...theme.componentsCare?.uiKit?.actionButton?.style,
                ...theme.componentsCare?.uiKit?.actionButton?.disabled?.style,
            },
        },
        minWidth: props.small ? 0 : undefined,
        padding: theme.componentsCare?.uiKit?.actionButton?.padding,
        paddingLeft: props.small ? theme.spacing(3) : undefined,
        paddingRight: props.small ? theme.spacing(3) : undefined,
        ...theme.componentsCare?.uiKit?.actionButton?.style,
    }),
    startIcon: (props) => ({
        margin: props.small ? 0 : undefined,
    }),
    outlined: (props) => ({
        borderRadius: theme.componentsCare?.uiKit?.actionButton?.borderRadius ||
            theme.shape.borderRadius,
        "&.Mui-disabled": {
            border: theme.componentsCare?.uiKit?.actionButton?.border,
            color: theme.palette.background.paper,
            backgroundColor: theme.componentsCare?.uiKit?.actionButton?.disabled?.backgroundColor,
        },
        padding: theme.componentsCare?.uiKit?.actionButton?.padding,
        paddingLeft: props.small ? theme.spacing(3) : undefined,
        paddingRight: props.small ? theme.spacing(3) : undefined,
        ...theme.componentsCare?.uiKit?.actionButton?.style,
    }),
    contained: (props) => ({
        borderRadius: theme.componentsCare?.uiKit?.actionButton?.borderRadius ||
            theme.shape.borderRadius,
        "&.Mui-disabled": {
            border: theme.componentsCare?.uiKit?.actionButton?.border,
            color: theme.palette.background.paper,
            backgroundColor: theme.componentsCare?.uiKit?.actionButton?.disabled?.backgroundColor,
        },
        padding: theme.componentsCare?.uiKit?.actionButton?.padding,
        paddingLeft: props.small ? theme.spacing(3) : undefined,
        paddingRight: props.small ? theme.spacing(3) : undefined,
        ...theme.componentsCare?.uiKit?.actionButton?.style,
    }),
    label: (props) => ({
        padding: 0,
        justifyContent: props.small ? "center" : "flex-start",
        ...theme.componentsCare?.uiKit?.actionButton?.label?.style,
    }),
}), { name: "CcActionButtonStyledButton" })(Button);
const ActionButton = (props) => {
    const { icon, fullWidth, small, children, ...otherProps } = props;
    const renderButton = () => (React.createElement(StyledButton, { variant: "contained", disableElevation: true, fullWidth: fullWidth ?? !small, startIcon: icon, 
        // to suppress warning
        small: small ? "true" : undefined, ...otherProps }, !small && React.createElement(Box, null, children)));
    if (props.disabled || !small)
        return renderButton();
    return React.createElement(Tooltip, { title: React.createElement("span", null, children) }, renderButton());
};
export default React.memo(ActionButton);
