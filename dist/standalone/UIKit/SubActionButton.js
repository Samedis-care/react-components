import React from "react";
import { Button, Tooltip } from "@mui/material";
import { withStyles } from "@mui/styles";
const StyledButton = withStyles((theme) => ({
    root: (props) => props.small
        ? {
            borderRadius: theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
            backgroundColor: theme.componentsCare?.uiKit?.subActionButton?.small
                ?.backgroundColor ||
                theme.componentsCare?.uiKit?.subActionButton?.backgroundColor ||
                theme.palette.background.default,
            color: theme.componentsCare?.uiKit?.subActionButton?.color ||
                theme.palette.text.primary,
            textTransform: "unset",
            justifyContent: "flex-start",
            borderColor: theme.palette.mode === "light"
                ? "rgba(0, 0, 0, 0.23)"
                : "rgba(255, 255, 255, 0.23)",
            "&:hover": {
                borderRadius: theme.componentsCare?.uiKit?.subActionButton?.small?.hover
                    ?.borderRadius,
                backgroundColor: theme.componentsCare?.uiKit?.subActionButton?.hover
                    ?.backgroundColor ||
                    theme.componentsCare?.uiKit?.subActionButton?.small?.hover
                        ?.backgroundColor ||
                    theme.palette.primary.light,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderTopWidth: props.disabledivider ? 0 : undefined,
                borderBottomWidth: 0,
                borderColor: theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.23)"
                    : "rgba(255, 255, 255, 0.23)",
                color: theme.componentsCare?.uiKit?.subActionButton?.small?.hover
                    ?.color ||
                    theme.componentsCare?.uiKit?.subActionButton?.hover?.color ||
                    theme.palette.primary.main,
                ...{
                    ...theme.componentsCare?.uiKit?.subActionButton?.hover?.style,
                    ...theme.componentsCare?.uiKit?.subActionButton?.small?.hover
                        ?.style,
                },
            },
            "&.Mui-disabled": {
                backgroundColor: theme.componentsCare?.uiKit?.subActionButton?.disabled
                    ?.backgroundColor,
                color: theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
                    theme.palette.text.disabled,
                ...theme.componentsCare?.uiKit?.subActionButton?.disabled?.style,
            },
            minWidth: theme.componentsCare?.uiKit?.subActionButton?.small?.minWidth ||
                "unset",
            padding: theme.componentsCare?.uiKit?.subActionButton?.small?.padding ||
                theme.spacing(1),
            ...theme.componentsCare?.uiKit?.subActionButton?.small?.style,
        }
        : {
            padding: theme.componentsCare?.uiKit?.subActionButton?.padding ||
                theme.spacing(1, 3),
            borderRadius: theme.componentsCare?.uiKit?.subActionButton?.borderRadius || 0,
            backgroundColor: theme.componentsCare?.uiKit?.subActionButton?.backgroundColor ||
                theme.palette.background.default,
            color: theme.componentsCare?.uiKit?.subActionButton?.color ||
                theme.palette.text.primary,
            textTransform: "unset",
            justifyContent: "flex-start",
            borderColor: theme.palette.mode === "light"
                ? "rgba(0, 0, 0, 0.23)"
                : "rgba(255, 255, 255, 0.23)",
            "&:hover": {
                backgroundColor: theme.componentsCare?.uiKit?.subActionButton?.hover
                    ?.backgroundColor || theme.palette.background.default,
                color: theme.componentsCare?.uiKit?.subActionButton?.hover?.color ||
                    theme.palette.primary.main,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderTopWidth: props.disabledivider ? 0 : undefined,
                borderBottomWidth: 0,
                borderColor: theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.23)"
                    : "rgba(255, 255, 255, 0.23)",
                ...theme.componentsCare?.uiKit?.subActionButton?.hover?.style,
            },
            "&.Mui-disabled": {
                backgroundColor: theme.componentsCare?.uiKit?.subActionButton?.disabled
                    ?.backgroundColor,
                color: theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
                    theme.palette.text.disabled,
                ...{
                    ...theme.componentsCare?.uiKit?.subActionButton?.style,
                    ...theme.componentsCare?.uiKit?.subActionButton?.disabled?.style,
                },
            },
            minWidth: theme.componentsCare?.uiKit?.subActionButton?.minWidth,
            ...theme.componentsCare?.uiKit?.subActionButton?.style,
        },
    outlined: (props) => props.small
        ? {
            "& svg": {
                fill: theme.componentsCare?.uiKit?.subActionButton?.small?.color ||
                    theme.palette.primary.main,
                ...theme.componentsCare?.uiKit?.subActionButton?.small?.icon?.style,
            },
            "&:hover svg": {
                fill: theme.componentsCare?.uiKit?.subActionButton?.small?.hover
                    ?.color || theme.palette.background.default,
                ...theme.componentsCare?.uiKit?.subActionButton?.small?.hover?.icon
                    ?.style,
            },
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopWidth: props.disabledivider ? 0 : undefined,
            borderRadius: 0,
            "&:first-child": {
                borderLeftWidth: 1,
                borderTopLeftRadius: theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
                borderBottomLeftRadius: theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
                ...theme.componentsCare?.uiKit?.subActionButton?.small?.firstChild
                    ?.style,
            },
            "&:last-child": {
                borderRightWidth: 1,
                borderTopRightRadius: theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
                borderBottomRightRadius: theme.componentsCare?.uiKit?.subActionButton?.small?.borderRadius,
                ...theme.componentsCare?.uiKit?.subActionButton?.small?.lastChild
                    ?.style,
            },
            "&.Mui-disabled": {
                "& svg": {
                    fill: theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
                        theme.palette.text.disabled,
                },
                borderRadiusWidth: 0,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                color: theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
                    theme.palette.text.disabled,
                "&:first-child": {
                    borderLeftWidth: 1,
                    ...theme.componentsCare?.uiKit?.subActionButton?.small?.disabled
                        ?.firstChild?.style,
                },
                "&:last-child": {
                    borderRightWidth: 1,
                    ...theme.componentsCare?.uiKit?.subActionButton?.small?.disabled
                        ?.lastChild?.style,
                },
            },
            padding: theme.spacing(2),
        }
        : {
            "& svg": {
                fill: theme.componentsCare?.uiKit?.subActionButton?.icon?.color ||
                    theme.componentsCare?.uiKit?.subActionButton?.color ||
                    theme.palette.primary.main,
                marginRight: theme.componentsCare?.uiKit?.subActionButton?.icon?.marginRight ||
                    theme.spacing(3),
                ...theme.componentsCare?.uiKit?.subActionButton?.icon?.style,
            },
            "&:hover svg": {
                fill: theme.componentsCare?.uiKit?.subActionButton?.hover?.icon
                    ?.color,
                ...theme.componentsCare?.uiKit?.subActionButton?.hover?.icon?.style,
            },
            borderRadius: theme.componentsCare?.uiKit?.subActionButton?.borderRadius,
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderBottomWidth: 0,
            borderTopWidth: props.disabledivider ? 0 : undefined,
            "&:first-child": theme.componentsCare?.uiKit?.subActionButton?.firstChild?.style,
            "&:last-child": theme.componentsCare?.uiKit?.subActionButton?.lastChild?.style,
            "&.Mui-disabled": {
                "& svg": {
                    fill: theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
                        theme.palette.text.disabled,
                    ...theme.componentsCare?.uiKit?.subActionButton?.disabled?.icon
                        ?.style,
                },
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderBottomWidth: 0,
                border: theme.componentsCare?.uiKit?.subActionButton?.disabled?.border ||
                    theme.componentsCare?.uiKit?.subActionButton?.border,
                color: theme.componentsCare?.uiKit?.subActionButton?.disabled?.color ||
                    theme.palette.text.disabled,
                "&:first-child": theme.componentsCare?.uiKit?.subActionButton?.disabled?.firstChild
                    ?.style,
                "&:last-child": theme.componentsCare?.uiKit?.subActionButton?.disabled?.lastChild
                    ?.style,
                ...theme.componentsCare?.uiKit?.subActionButton?.disabled?.style,
            },
            padding: theme.componentsCare?.uiKit?.subActionButton?.padding ||
                theme.spacing(2, 3),
            ...theme.componentsCare?.uiKit?.subActionButton?.style,
        },
    label: {
        justifyContent: theme.componentsCare?.uiKit?.subActionButton?.label?.justifyContent ||
            "flex-start",
        ...theme.componentsCare?.uiKit?.subActionButton?.label?.style,
    },
}))(Button);
const SubActionButton = (props) => {
    const { icon, small, children, disableDivider, ...otherProps } = props;
    const renderButton = () => (React.createElement(StyledButton, { variant: "outlined", fullWidth: !small, 
        // suppress warning
        disabledivider: disableDivider ? "true" : undefined, ...otherProps },
        icon,
        " ",
        !small && children));
    if (props.disabled || !small)
        return renderButton();
    return React.createElement(Tooltip, { title: children }, renderButton());
};
export default React.memo(SubActionButton);
