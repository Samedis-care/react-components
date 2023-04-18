import React, { useCallback, useContext, useState, } from "react";
import { Collapse } from "@mui/material";
/**
 * Context for the menu state
 */
export var MenuContext = React.createContext(undefined);
var MenuItem = function (props) {
    var _a;
    var depth = props.depth, title = props.title, expandable = props.expandable, forceExpand = props.forceExpand, onClick = props.onClick, onAuxClick = props.onAuxClick, menuItemId = props.menuItemId;
    var _b = useState(false), expanded = _b[0], setExpanded = _b[1];
    var menuContext = useContext(MenuContext);
    if (!menuContext)
        throw new Error("MenuContext is undefined");
    var menuState = menuContext[0], setMenuState = menuContext[1];
    var clickProxy = useCallback(function (evt) {
        if (expandable)
            setExpanded(forceExpand ? true : function (prevFlag) { return !prevFlag; });
        else
            setMenuState(menuItemId);
        onClick(evt);
    }, [expandable, forceExpand, setMenuState, menuItemId, onClick]);
    // force expand
    if (expandable && !expanded && forceExpand) {
        setExpanded(true);
    }
    var Renderer = props.menuProps.menuItem;
    return (React.createElement(React.Fragment, null,
        React.createElement(Renderer, { icon: props.icon, title: title, expandable: expandable, expanded: expandable ? expanded : undefined, active: expandable ? undefined : menuState === menuItemId, onClick: clickProxy, onAuxClick: onAuxClick, depth: depth }),
        expandable && (React.createElement(Collapse, { in: expanded, className: props.childWrapperClassName }, (_a = props.childDefs) === null || _a === void 0 ? void 0 : _a.map(function (child) {
            return toMenuItemComponent(props.menuProps, child, depth + 1, menuItemId);
        })))));
};
export default React.memo(MenuItem);
export var toMenuItemComponent = function (menuProps, def, depth, menuItemId) {
    var _a;
    return def.shouldRender && (React.createElement(MenuItem, { key: menuItemId ? "".concat(menuItemId, "@").concat(def.title) : def.title, menuItemId: menuItemId ? "".concat(menuItemId, "@").concat(def.title) : def.title, icon: def.icon, title: def.title, expandable: !!(def.children && def.children.length > 0), onClick: def.onClick, onAuxClick: (_a = def.onAuxClick) !== null && _a !== void 0 ? _a : (function () { return undefined; }), menuProps: menuProps, childDefs: def.children, forceExpand: !!def.forceExpand, depth: depth, childWrapperClassName: menuProps.childWrapperClassName }));
};
