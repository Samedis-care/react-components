import React, { useLayoutEffect } from "react";

/**
 * Props of {@link RoutedTabPanelFallback}
 */
export interface RoutedTabPanelFallbackProps {
	/**
	 * What the panel shows while its content suspends: the `fallback` of
	 * `RoutedTabPanelWrapper`
	 */
	children: React.ReactNode;
	/**
	 * Called with `true` when the fallback appears and with `false` when it
	 * goes, in a layout effect, so that the panel's `aria-busy` changes in the
	 * same frame as the content
	 */
	onShownChange: (shown: boolean) => void;
}

/**
 * The Suspense fallback of `RoutedTabPanelWrapper`'s panel: shows `children`
 * and reports while it is shown, which makes the tabpanel `aria-busy`.
 * @param props The props
 */
const RoutedTabPanelFallback = (props: RoutedTabPanelFallbackProps) => {
	const { children, onShownChange } = props;
	useLayoutEffect(() => {
		onShownChange(true);
		return () => onShownChange(false);
	}, [onShownChange]);
	return <>{children}</>;
};

export default React.memo(RoutedTabPanelFallback);
