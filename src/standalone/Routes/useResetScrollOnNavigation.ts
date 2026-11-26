import React, { useContext, useEffect } from "react";
import type { NavigationScrollManager } from "./NavigationScrollManager";

/**
 * The scroll manager of the nearest HistoryRouter, null outside of one
 */
export const NavigationScrollContext =
	React.createContext<NavigationScrollManager | null>(null);

/**
 * Scrolls an element to the top after each navigation that scrolls the window
 * to the top: a push or replace of the nearest HistoryRouter, but not a
 * back/forward navigation, a navigation a blocker cancels, or one started with
 * `preventScrollReset` (see `useNavigate`; RoutedTabs' tab switches).
 *
 * For a scroll container that stays on screen while the pages in it change,
 * such as the main pane of a layout: without it, the next page opens at the
 * offset the user had scrolled the last one to. PortalLayout registers its
 * main pane. A container that is part of the page itself needs it only when
 * the page stays mounted across navigations (a route whose param changes).
 *
 * The container is registered from mount to unmount; the element the ref
 * holds when a navigation happens is the one reset. Does nothing outside a
 * HistoryRouter.
 * @param ref The scroll container
 */
const useResetScrollOnNavigation = (
	ref: React.RefObject<HTMLElement | null>,
): void => {
	const manager = useContext(NavigationScrollContext);
	useEffect(() => manager?.register(ref), [manager, ref]);
};

export default useResetScrollOnNavigation;
