import React from "react";
/**
 * Makes an element the heading of the current page while the calling
 * component is mounted. After a navigation that leaves the keyboard focus on
 * no element or out of view, HistoryRouter moves the focus to the heading set
 * in the deepest route; of headings in the same route, the one set last.
 * A heading without text is skipped until it has some.
 * Used by PageTitle; internal, not exported from the package root.
 * Outside a HistoryRouter it does nothing.
 * @param heading A ref to the heading element; null for none, e.g. while the
 * heading does not name the page
 */
declare const usePageHeading: (heading: React.RefObject<HTMLElement | null> | null) => void;
export default usePageHeading;
