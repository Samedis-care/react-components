import React, { useContext, useLayoutEffect } from "react";
/**
 * Hands keyboard focus from a grid to the grid mounted in its place. The
 * persistence providers provide it, as they mount their children again when
 * their storage keys change; outside of one (null), focus is not handed over.
 */
export const DataGridFocusHandoffContext = React.createContext(null);
/**
 * Elements that take keyboard focus, in document order
 */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex^="-"])';
/**
 * Where an element is in the grid
 * @param root The grid's root element
 * @param element The element, inside the root
 * @param mount The mount of the provider's children the grid belongs to
 * @returns Its place and what it is
 */
const locate = (root, element, mount) => {
    const path = [];
    for (let node = element, parent = node.parentElement; node !== root && parent; node = parent, parent = node.parentElement)
        path.unshift(Array.prototype.indexOf.call(parent.children, node));
    return {
        path,
        tagName: element.tagName,
        role: element.getAttribute("role"),
        type: element.getAttribute("type"),
        mount,
    };
};
/**
 * The element at the same place in the grid, if it is the same kind of
 * element (tag, role and type)
 * @param root The grid's root element
 * @param handoff Where focus was
 * @returns The element, or null if there is none or another kind of element
 */
const find = (root, handoff) => {
    let node = root;
    for (const index of handoff.path) {
        const child = node.children.item(index);
        if (!child)
            return null;
        node = child;
    }
    if (node.tagName !== handoff.tagName ||
        node.getAttribute("role") !== handoff.role ||
        node.getAttribute("type") !== handoff.type)
        return null;
    return node;
};
/**
 * Focuses an element
 * @param element The element
 * @returns Whether it has focus now (a hidden or disabled element refuses it)
 */
const tryFocus = (element) => {
    element.focus();
    return element.ownerDocument.activeElement === element;
};
/**
 * Keeps keyboard focus in a grid that a persistence provider mounts again
 * (DataGridLocalStoragePersist, DataGridStorageManagerPersist, when their
 * storage keys change). When the grid unmounts while focus is inside it,
 * focus moves to the grid mounted in its place for the new keys: to the
 * element at the same place, if that is the same kind of element and takes
 * focus, or else to the grid's first element that does. Focus that is not on
 * the page body by then (it moved on meanwhile, or the new grid's own
 * `autoFocus` took it) stays where it is.
 *
 * Called by the component that renders the root element (DataGrid): the
 * layout effects of the elements inside it run before React sets its ref.
 * @param rootRef The grid's root element
 */
export const useDataGridFocusHandoff = (rootRef) => {
    const ctx = useContext(DataGridFocusHandoffContext);
    // a layout effect: its cleanup runs before the grid's elements are removed,
    // while focus is still in them, and it runs once the new grid's elements
    // are in the document, before the browser paints
    useLayoutEffect(() => {
        const root = rootRef.current;
        if (!ctx || !root)
            return;
        const { handoff, mount } = ctx;
        const doc = root.ownerDocument;
        const pending = handoff.current;
        handoff.current = null;
        const active = doc.activeElement;
        if (pending &&
            pending.mount !== mount &&
            (!active || active === doc.body)) {
            const same = find(root, pending);
            if (!same || !tryFocus(same))
                Array.from(root.querySelectorAll(FOCUSABLE)).find(tryFocus);
        }
        return () => {
            const focused = doc.activeElement;
            if (focused && focused !== root && root.contains(focused))
                handoff.current = locate(root, focused, mount);
        };
    }, [ctx, rootRef]);
};
