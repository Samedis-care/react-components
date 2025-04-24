import React, { useCallback } from "react";
import { Grid2 as Grid, Typography } from "@mui/material";
import { KeyboardArrowUp as ClosedIcon, KeyboardArrowDown as ExpandedIcon, } from "@mui/icons-material";
const TreeViewDefaultRenderer = (props) => {
    const { expanded, icon, label, hasChildren, onToggleExpanded, expandLocked, id, depth, onClick, onAuxClick, } = props;
    const handleExpand = useCallback(() => onToggleExpanded(id), [onToggleExpanded, id]);
    return (React.createElement(Grid, { container: true, style: {
            height: 24,
            marginLeft: depth * 48,
            width: `calc(100% - ${depth * 48}px)`,
        }, wrap: "nowrap" },
        hasChildren && (React.createElement(Grid, { style: { height: 24 }, key: "expandable", onClick: expandLocked ? undefined : handleExpand }, expanded ? React.createElement(ExpandedIcon, null) : React.createElement(ClosedIcon, null))),
        icon && (React.createElement(Grid, { key: "icon", onClick: onClick, onAuxClick: onAuxClick }, icon)),
        React.createElement(Grid, { key: "label", onClick: onClick, onAuxClick: onAuxClick, size: "grow" },
            React.createElement(Typography, { noWrap: true }, label))));
};
export default React.memo(TreeViewDefaultRenderer);
