import React, { useCallback, useState } from "react";
import { Grid, IconButton } from "@mui/material";
import { DoubleArrow } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { usePortalLayoutContext } from "./Layout";
import { combineClassNames } from "../../utils";
const useStyles = makeStyles({
    container: {
        width: "100%",
        height: "100%",
        overflow: "auto",
    },
    content: {
        "& > div": {
            overflow: "unset",
        },
    },
    bar: {
        position: "sticky",
        top: 0,
    },
    iconOpen: {},
    iconClose: {
        transform: "rotate(180deg)",
    },
}, { name: "CcPortal" });
const CollapsibleMenu = (props) => {
    const classes = useStyles(props);
    const [collapsed, setCollapsed] = useState(false);
    const { mobile } = usePortalLayoutContext();
    const toggleCollapsed = useCallback(() => setCollapsed((prev) => !prev), [setCollapsed]);
    return (React.createElement(Grid, { container: true, justifyContent: "flex-start", alignItems: "stretch", wrap: "nowrap", style: collapsed ? { overflow: "visible" } : undefined, className: combineClassNames([
            classes.container,
            props.customClasses?.root,
        ]) },
        React.createElement(Grid, { item: true, xs: true, style: { width: props.width, display: collapsed ? "none" : undefined }, className: classes.content, key: "content" }, props.children),
        !mobile && (React.createElement(Grid, { item: true, key: "bar", className: classes.bar },
            React.createElement(IconButton, { onClick: toggleCollapsed, className: props.customClasses?.button, size: "large" },
                React.createElement(DoubleArrow, { className: collapsed ? classes.iconOpen : classes.iconClose }))))));
};
export default React.memo(CollapsibleMenu);
