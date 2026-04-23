import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Grid, Typography } from "@mui/material";
import { KeyboardArrowUp as ClosedIcon, KeyboardArrowDown as ExpandedIcon, } from "@mui/icons-material";
const TreeViewDefaultRenderer = (props) => {
    const { expanded, icon, label, hasChildren, onToggleExpanded, expandLocked, id, depth, onClick, onAuxClick, } = props;
    const handleExpand = useCallback(() => onToggleExpanded(id), [onToggleExpanded, id]);
    return (_jsxs(Grid, { container: true, style: {
            height: 24,
            marginLeft: depth * 48,
            width: `calc(100% - ${depth * 48}px)`,
        }, wrap: "nowrap", children: [hasChildren && (_jsx(Grid, { style: { height: 24 }, onClick: expandLocked ? undefined : handleExpand, children: expanded ? _jsx(ExpandedIcon, {}) : _jsx(ClosedIcon, {}) }, "expandable")), icon && (_jsx(Grid, { onClick: onClick, onAuxClick: onAuxClick, children: icon }, "icon")), _jsx(Grid, { onClick: onClick, onAuxClick: onAuxClick, size: "grow", children: _jsx(Typography, { noWrap: true, children: label }) }, "label")] }));
};
export default React.memo(TreeViewDefaultRenderer);
