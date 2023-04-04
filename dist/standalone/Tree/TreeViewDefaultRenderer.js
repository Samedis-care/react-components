import React, { useCallback } from "react";
import { Grid, Typography } from "@material-ui/core";
import { KeyboardArrowUp as ClosedIcon, KeyboardArrowDown as ExpandedIcon, } from "@material-ui/icons";
var TreeViewDefaultRenderer = function (props) {
    var expanded = props.expanded, icon = props.icon, label = props.label, hasChildren = props.hasChildren, onToggleExpanded = props.onToggleExpanded, id = props.id, depth = props.depth;
    var handleExpand = useCallback(function () { return onToggleExpanded(id); }, [
        onToggleExpanded,
        id,
    ]);
    return (React.createElement(Grid, { container: true, style: {
            height: 24,
            marginLeft: depth * 48,
            width: "calc(100% - ".concat(depth * 48, "px)"),
        }, wrap: "nowrap" },
        hasChildren && (React.createElement(Grid, { item: true, style: { height: 24 }, key: "expandable", onClick: handleExpand }, expanded ? React.createElement(ExpandedIcon, null) : React.createElement(ClosedIcon, null))),
        icon && (React.createElement(Grid, { item: true, key: "icon" }, icon)),
        React.createElement(Grid, { item: true, xs: true, key: "label" },
            React.createElement(Typography, { noWrap: true }, label))));
};
export default React.memo(TreeViewDefaultRenderer);
