import React, { useContext } from "react";
import { RouteContext } from "./Route";
import { useRegisterPageHeading } from "./DocumentTitle";

/**
 * Makes an element the heading of the current page while the calling
 * component is mounted. After a navigation that leaves the keyboard focus on
 * no element or out of view, HistoryRouter moves the focus to the heading set
 * in the deepest route; of headings in the same route, the one set last.
 * A HistoryRouter inside another one only to a heading set inside it.
 * A heading without text is skipped until it has some.
 * Used by PageTitle; internal, not exported from the package root.
 * Outside a HistoryRouter it does nothing.
 * @param heading A ref to the heading element; null for none, e.g. while the
 * heading does not name the page
 */
const usePageHeading = (
	heading: React.RefObject<HTMLElement | null> | null,
): void => {
	const route = useContext(RouteContext);
	useRegisterPageHeading(heading, route ? route.depth : -1);
};

export default usePageHeading;
