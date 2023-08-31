import React, { useCallback, useContext, useState, } from "react";
import { Collapse } from "@mui/material";
/**
 * Context for the menu state
 */
export const MenuContext = React.createContext(undefined);
const MenuItem = (props) => {
    const { depth, title, expandable, forceExpand, onClick, onAuxClick, menuItemId, } = props;
    const [expanded, setExpanded] = useState(false);
    const menuContext = useContext(MenuContext);
    if (!menuContext)
        throw new Error("MenuContext is undefined");
    const [menuState, setMenuState] = menuContext;
    const clickProxy = useCallback((evt) => {
        if (expandable)
            setExpanded(forceExpand ? true : (prevFlag) => !prevFlag);
        else
            setMenuState(menuItemId);
        onClick(evt);
    }, [expandable, forceExpand, setMenuState, menuItemId, onClick]);
    // force expand
    if (expandable && !expanded && forceExpand) {
        setExpanded(true);
    }
    const Renderer = props.menuProps.menuItem;
    return (React.createElement(React.Fragment, null,
        React.createElement(Renderer, { icon: props.icon, title: title, expandable: expandable, expanded: expandable ? expanded : undefined, active: expandable ? undefined : menuState === menuItemId, onClick: clickProxy, onAuxClick: onAuxClick, depth: depth }),
        expandable && (React.createElement(Collapse, { in: expanded, className: props.childWrapperClassName }, props.childDefs?.map((child) => toMenuItemComponent(props.menuProps, child, depth + 1, menuItemId))))));
};
export default React.memo(MenuItem);
export const toMenuItemComponent = (menuProps, def, depth, menuItemId) => def.shouldRender && (React.createElement(MenuItem, { key: menuItemId ? `${menuItemId}@${def.title}` : def.title, menuItemId: menuItemId ? `${menuItemId}@${def.title}` : def.title, icon: def.icon, title: def.title, expandable: !!(def.children && def.children.length > 0), onClick: def.onClick, onAuxClick: def.onAuxClick ?? (() => undefined), menuProps: menuProps, childDefs: def.children, forceExpand: !!def.forceExpand, depth: depth, childWrapperClassName: menuProps.childWrapperClassName }));
