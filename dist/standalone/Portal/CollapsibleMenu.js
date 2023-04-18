import React, { useCallback, useState } from "react";
import { Grid, IconButton } from "@mui/material";
import { DoubleArrow } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";
import { usePortalLayoutContext } from "./Layout";
import { combineClassNames } from "../../utils";
var useStyles = makeStyles({
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
var CollapsibleMenu = function (props) {
    var _a, _b;
    var classes = useStyles(props);
    var _c = useState(false), collapsed = _c[0], setCollapsed = _c[1];
    var mobile = usePortalLayoutContext().mobile;
    var toggleCollapsed = useCallback(function () { return setCollapsed(function (prev) { return !prev; }); }, [
        setCollapsed,
    ]);
    return (React.createElement(Grid, { container: true, justifyContent: "flex-start", alignItems: "stretch", wrap: "nowrap", style: collapsed ? { overflow: "visible" } : undefined, className: combineClassNames([
            classes.container,
            (_a = props.customClasses) === null || _a === void 0 ? void 0 : _a.root,
        ]) },
        React.createElement(Grid, { item: true, xs: true, style: { width: props.width, display: collapsed ? "none" : undefined }, className: classes.content, key: "content" }, props.children),
        !mobile && (React.createElement(Grid, { item: true, key: "bar", className: classes.bar },
            React.createElement(IconButton, { onClick: toggleCollapsed, className: (_b = props.customClasses) === null || _b === void 0 ? void 0 : _b.button, size: "large" },
                React.createElement(DoubleArrow, { className: collapsed ? classes.iconOpen : classes.iconClose }))))));
};
export default React.memo(CollapsibleMenu);
