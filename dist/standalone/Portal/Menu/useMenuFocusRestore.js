import { useCallback, useLayoutEffect, useRef } from "react";
/**
 * Elements that take keyboard focus, in the order Tab reaches them (tabindex
 * order aside)
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/**
 * Focuses an element
 * @param element The element
 * @return Whether it has focus now (a hidden or disabled element refuses it)
 */
const tryFocus = (element) => {
    element.focus();
    return element.ownerDocument.activeElement === element;
};
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
const useMenuFocusRestore = (rootRef, entries, activeId) => {
    // the element in the menu that has focus; kept when it is removed with its entry
    const focusedRef = useRef(null);
    // where focus was moved after a loss, until the next commit of the menu
    const movedToRef = useRef(null);
    const onFocus = useCallback((evt) => {
        focusedRef.current = evt.target;
    }, []);
    const onBlur = useCallback((evt) => {
        const target = evt.target;
        // a browser may blur an element that is being removed while it is still
        // connected: decide once the removal is done
        queueMicrotask(() => {
            if (focusedRef.current === target && target.isConnected)
                focusedRef.current = null;
        });
    }, []);
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!root)
            return;
        const doc = root.ownerDocument;
        // focus was moved in the previous commit: follow a highlight that came late
        const movedTo = movedToRef.current;
        movedToRef.current = null;
        if (movedTo && doc.activeElement === movedTo) {
            const highlighted = entries.get(activeId);
            if (highlighted && highlighted !== movedTo)
                tryFocus(highlighted);
            return;
        }
        const focused = focusedRef.current;
        if (!focused || focused.isConnected)
            return;
        focusedRef.current = null;
        // only take over focus that was lost with the element
        if (doc.activeElement && doc.activeElement !== doc.body)
            return;
        const highlighted = entries.get(activeId);
        const target = [
            ...(highlighted ? [highlighted] : []),
            ...root.querySelectorAll(FOCUSABLE),
            root,
        ].find(tryFocus);
        movedToRef.current = target ?? null;
    });
    return { onFocus, onBlur };
};
export default useMenuFocusRestore;
