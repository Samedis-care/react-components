import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Checkbox, Grid, Typography } from "@mui/material";
import { KeyboardArrowUp as ClosedIcon, KeyboardArrowDown as ExpandedIcon, } from "@mui/icons-material";
const TreeViewCheckboxSelectionRenderer = (props) => {
    const { expanded, icon, label, hasChildren, onToggleExpanded, expandLocked, id, depth, hasNext, parentHasNext, onClick, onAuxClick, } = props;
    const handleExpand = useCallback(() => onToggleExpanded(id), [onToggleExpanded, id]);
    const offsetLeft = depth > 0 ? 12 : 0;
    return (_jsxs(Grid, { container: true, style: {
            height: 24,
            marginLeft: offsetLeft,
            width: `calc(100% - ${offsetLeft}px)`,
        }, wrap: "nowrap", children: [depth !== 0 && (_jsxs(_Fragment, { children: [parentHasNext.slice(1).map((pHasNext, idx) => (_jsx(Grid, { children: _jsx("div", { style: {
                                height: 24,
                                width: 24,
                                borderLeft: pHasNext ? "1px solid black" : undefined,
                            } }) }, idx))), _jsxs(Grid, { children: [_jsx("div", { style: {
                                    height: 12,
                                    width: 12,
                                    borderLeft: "1px solid black",
                                    borderBottom: "1px solid black",
                                } }), _jsx("div", { style: {
                                    height: 12,
                                    width: 12,
                                    borderLeft: hasNext ? "1px solid black" : undefined,
                                } })] })] })), _jsx(Grid, { style: { height: 24 }, onClick: expandLocked ? undefined : handleExpand, children: hasChildren ? (expanded ? (_jsx(ExpandedIcon, {})) : (_jsx(ClosedIcon, {}))) : (_jsx(Checkbox, { style: { padding: 0 }, checked: expanded })) }, "expandable"), icon && (_jsx(Grid, { onClick: onClick, onAuxClick: onAuxClick, children: icon }, "icon")), _jsx(Grid, { onClick: onClick, onAuxClick: onAuxClick, size: "grow", children: _jsx(Typography, { noWrap: true, children: label }) }, "label")] }));
};
export default React.memo(TreeViewCheckboxSelectionRenderer);
