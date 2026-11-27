import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useLayoutEffect } from "react";
/**
 * The Suspense fallback of `RoutedTabPanelWrapper`'s panel: shows `children`
 * and reports while it is shown, which makes the tabpanel `aria-busy`.
 * @param props The props
 */
const RoutedTabPanelFallback = (props) => {
    const { children, onShownChange } = props;
    useLayoutEffect(() => {
        onShownChange(true);
        return () => onShownChange(false);
    }, [onShownChange]);
    return _jsx(_Fragment, { children: children });
};
export default React.memo(RoutedTabPanelFallback);
