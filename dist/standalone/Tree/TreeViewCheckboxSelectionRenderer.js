import React, { useCallback } from "react";
import { Checkbox, Grid, Typography } from "@mui/material";
import { KeyboardArrowUp as ClosedIcon, KeyboardArrowDown as ExpandedIcon, } from "@mui/icons-material";
var TreeViewCheckboxSelectionRenderer = function (props) {
    var expanded = props.expanded, icon = props.icon, label = props.label, hasChildren = props.hasChildren, onToggleExpanded = props.onToggleExpanded, id = props.id, depth = props.depth, hasNext = props.hasNext;
    var handleExpand = useCallback(function () { return onToggleExpanded(id); }, [
        onToggleExpanded,
        id,
    ]);
    var offsetLeft = Math.max(depth * 24 - 12, 0);
    return (React.createElement(Grid, { container: true, style: {
            height: 24,
            marginLeft: offsetLeft,
            width: "calc(100% - ".concat(offsetLeft, "px)"),
        }, wrap: "nowrap" },
        depth !== 0 && (React.createElement(Grid, { item: true },
            React.createElement("div", { style: {
                    height: 12,
                    width: 12,
                    borderLeft: "1px solid black",
                    borderBottom: "1px solid black",
                } }),
            React.createElement("div", { style: {
                    height: 12,
                    width: 12,
                    borderLeft: hasNext ? "1px solid black" : undefined,
                } }))),
        React.createElement(Grid, { item: true, style: { height: 24 }, key: "expandable", onClick: handleExpand }, hasChildren ? (expanded ? (React.createElement(ExpandedIcon, null)) : (React.createElement(ClosedIcon, null))) : (React.createElement(Checkbox, { style: { padding: 0 }, checked: expanded }))),
        icon && (React.createElement(Grid, { item: true, key: "icon" }, icon)),
        React.createElement(Grid, { item: true, xs: true, key: "label" },
            React.createElement(Typography, { noWrap: true }, label))));
};
export default React.memo(TreeViewCheckboxSelectionRenderer);
