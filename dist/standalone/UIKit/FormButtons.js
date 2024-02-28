import React from "react";
import { Unstable_Grid2 as Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { alpha } from "@mui/material/styles";
const useStyles = makeStyles((theme) => ({
    container: {
        width: theme.componentsCare?.uiKit?.formButtons?.container?.width,
        margin: theme.componentsCare?.uiKit?.formButtons?.container?.margin,
        padding: theme.componentsCare?.uiKit?.formButtons?.container?.padding ||
            theme.spacing(3),
        border: theme.componentsCare?.uiKit?.formButtons?.container?.border ||
            undefined,
        borderRadius: theme.componentsCare?.uiKit?.formButtons?.container?.borderRadius,
        backgroundColor: alpha(theme.componentsCare?.uiKit?.formButtons?.container?.backgroundColor ||
            theme.palette.background.paper, theme.componentsCare?.uiKit?.formButtons?.container
            ?.backgroundColorOpacity || 1),
        ...theme.componentsCare?.uiKit?.formButtons?.container?.style,
    },
    buttonWrapper: {
        margin: theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.margin ||
            theme.spacing(0, 1, 0, 0),
        "&:first-child": {
            marginLeft: 0,
            ...theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.firstChild
                ?.style,
        },
        "&:last-child": {
            marginRight: 0,
            ...theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.lastChild
                ?.style,
        },
        ...theme.componentsCare?.uiKit?.formButtons?.buttonWrapper?.style,
    },
}), { name: "CcFormButtons" });
const FormButtons = (props) => {
    const classes = useStyles(props);
    const children = (Array.isArray(props.children) ? props.children : [props.children]).filter((child) => child !== undefined && child !== null && child !== false);
    if (children.length === 0)
        return React.createElement(React.Fragment, null);
    return (React.createElement(Grid, { container: true, direction: "row", spacing: 2, className: classes.container, wrap: "nowrap" }, children.map((child, index) => {
        return (React.createElement(Grid, { className: classes.buttonWrapper, key: index }, child));
    })));
};
export default React.memo(FormButtons);
