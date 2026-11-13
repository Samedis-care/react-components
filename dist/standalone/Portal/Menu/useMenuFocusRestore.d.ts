import React from "react";
/**
 * Keeps keyboard focus in the menu when the focused element is removed with its
 * entry, e.g. because a navigation swapped the definition or a permission change
 * hid the entry. Focus then moves to the highlighted entry; if that cannot take
 * it, to the first focusable element of the menu, and if there is none, to the
 * menu's root. Focus that is already elsewhere (not on the page body) stays where
 * it is. If the highlight moves in the next commit of the menu (RoutedMenu sets it
 * in an effect after a navigation) while focus is still where it was put, focus
 * follows it.
 * @param rootRef The menu's root element; it must be focusable (tabindex -1)
 * @param entries The elements of the rendered entries by entry id (focusRef)
 * @param activeId The id of the highlighted entry
 * @return The focus handlers for the root element
 */
declare const useMenuFocusRestore: (rootRef: React.RefObject<HTMLElement | null>, entries: Map<string, HTMLElement>, activeId: string) => {
    onFocus: (evt: React.FocusEvent<HTMLElement>) => void;
    onBlur: (evt: React.FocusEvent<HTMLElement>) => void;
};
export default useMenuFocusRestore;
