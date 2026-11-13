import { jsx as _jsx } from "react/jsx-runtime";
import React, { useRef, useState } from "react";
import { MenuContext, MenuEntryElementsContext, toMenuItemComponent, } from "./MenuItem";
import useMenuFocusRestore from "./useMenuFocusRestore";
import combineClassNames from "../../../utils/combineClassNames";
import { styled, useThemeProps } from "@mui/material";
// tabindex -1: focus goes here when the focused entry is removed and the menu
// has no focusable element left
const Root = styled("div", { name: "CcPortalMenu", slot: "root" })({
    height: "100%",
    width: "100%",
    overflow: "auto",
});
/**
 * A menu tree rendered with the given wrapper and entry renderer. A click on an
 * entry highlights it (a group expands or collapses instead).
 *
 * Keyboard focus stays in the menu when the focused entry is removed (the
 * definition changed, e.g. after a navigation, or `shouldRender` turned false):
 * it moves to the highlighted entry, or, if that cannot take focus, to the first
 * focusable element of the menu. Focus that is elsewhere is left alone.
 */
const PortalMenu = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcPortalMenu" });
    const { wrapper: Wrapper, className, classes, customState, definition, } = props;
    const state = useState("");
    const menuState = customState || state;
    const [entries] = useState(() => new Map());
    const rootRef = useRef(null);
    const { onFocus, onBlur } = useMenuFocusRestore(rootRef, entries, menuState[0]);
    return (_jsx(Root, { ref: rootRef, className: combineClassNames([className, classes?.root]), tabIndex: -1, onFocus: onFocus, onBlur: onBlur, children: _jsx(Wrapper, { children: _jsx(MenuEntryElementsContext.Provider, { value: entries, children: _jsx(MenuContext.Provider, { value: menuState, children: definition.map((child) => toMenuItemComponent(props, child, 0, null)) }) }) }) }));
};
export default React.memo(PortalMenu);
