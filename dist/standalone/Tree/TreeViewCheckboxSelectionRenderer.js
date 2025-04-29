import React, { useCallback } from "react";
import { Checkbox, Grid, Typography } from "@mui/material";
import { KeyboardArrowUp as ClosedIcon, KeyboardArrowDown as ExpandedIcon, } from "@mui/icons-material";
const TreeViewCheckboxSelectionRenderer = (props) => {
    const { expanded, icon, label, hasChildren, onToggleExpanded, expandLocked, id, depth, hasNext, parentHasNext, onClick, onAuxClick, } = props;
    const handleExpand = useCallback(() => onToggleExpanded(id), [onToggleExpanded, id]);
    const offsetLeft = depth > 0 ? 12 : 0;
    return (React.createElement(Grid, { container: true, style: {
            height: 24,
            marginLeft: offsetLeft,
            width: `calc(100% - ${offsetLeft}px)`,
        }, wrap: "nowrap" },
        depth !== 0 && (React.createElement(React.Fragment, null,
            parentHasNext.slice(1).map((pHasNext, idx) => (React.createElement(Grid, { key: idx },
                React.createElement("div", { style: {
                        height: 24,
                        width: 24,
                        borderLeft: pHasNext ? "1px solid black" : undefined,
                    } })))),
            React.createElement(Grid, null,
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
                    } })))),
        React.createElement(Grid, { style: { height: 24 }, key: "expandable", onClick: expandLocked ? undefined : handleExpand }, hasChildren ? (expanded ? (React.createElement(ExpandedIcon, null)) : (React.createElement(ClosedIcon, null))) : (React.createElement(Checkbox, { style: { padding: 0 }, checked: expanded }))),
        icon && (React.createElement(Grid, { key: "icon", onClick: onClick, onAuxClick: onAuxClick }, icon)),
        React.createElement(Grid, { key: "label", onClick: onClick, onAuxClick: onAuxClick, size: "grow" },
            React.createElement(Typography, { noWrap: true }, label))));
};
export default React.memo(TreeViewCheckboxSelectionRenderer);
