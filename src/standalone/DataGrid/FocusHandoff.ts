import React, { useContext, useLayoutEffect } from "react";

/**
 * Where keyboard focus was in a grid that unmounted while it had focus
 */
export interface DataGridFocusHandoff {
	/**
	 * The focused element's place below the grid's root element: per level,
	 * its index among its parent's element children
	 */
	path: number[];
	/**
	 * The focused element's tag name
	 */
	tagName: string;
	/**
	 * The focused element's `role` attribute, or null without one
	 */
	role: string | null;
	/**
	 * The focused element's `type` attribute, or null without one
	 */
	type: string | null;
	/**
	 * The mount of the provider's children the grid belonged to
	 * (DataGridFocusHandoffContextType.mount)
	 */
	mount: unknown;
}

/**
 * What a persistence provider provides to hand keyboard focus over
 */
export interface DataGridFocusHandoffContextType {
	/**
	 * Where focus was in a grid that unmounted, until a grid mounts in its
	 * place and takes it over (null when there is nothing to hand over). The
	 * same ref in every mount of the provider's children.
	 */
	handoff: { current: DataGridFocusHandoff | null };
	/**
	 * Identifies the provider's current mount of its children (compared with
	 * `===`): another value once the provider mounts them again for new storage
	 * keys. A grid takes focus over from a grid of another mount only, not from
	 * one that the app unmounted and shows again (CRUD's grid while a form is
	 * open), which takes focus as it would without a provider.
	 */
	mount: unknown;
}

/**
 * Hands keyboard focus from a grid to the grid mounted in its place. The
 * persistence providers provide it, as they mount their children again when
 * their storage keys change; outside of one (null), focus is not handed over.
 */
export const DataGridFocusHandoffContext =
	React.createContext<DataGridFocusHandoffContextType | null>(null);

/**
 * Elements that take keyboard focus, in document order
 */
const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex^="-"])';

/**
 * Where an element is in the grid
 * @param root The grid's root element
 * @param element The element, inside the root
 * @param mount The mount of the provider's children the grid belongs to
 * @returns Its place and what it is
 */
const locate = (
	root: Element,
	element: Element,
	mount: unknown,
): DataGridFocusHandoff => {
	const path: number[] = [];
	for (
		let node = element, parent = node.parentElement;
		node !== root && parent;
		node = parent, parent = node.parentElement
	)
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
const find = (
	root: Element,
	handoff: DataGridFocusHandoff,
): HTMLElement | SVGElement | null => {
	let node = root;
	for (const index of handoff.path) {
		const child = node.children.item(index);
		if (!child) return null;
		node = child;
	}
	if (
		node.tagName !== handoff.tagName ||
		node.getAttribute("role") !== handoff.role ||
		node.getAttribute("type") !== handoff.type
	)
		return null;
	return node as HTMLElement | SVGElement;
};

/**
 * Focuses an element
 * @param element The element
 * @returns Whether it has focus now (a hidden or disabled element refuses it)
 */
const tryFocus = (element: HTMLElement | SVGElement): boolean => {
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
export const useDataGridFocusHandoff = (
	rootRef: React.RefObject<HTMLElement | null>,
) => {
	const ctx = useContext(DataGridFocusHandoffContext);
	// a layout effect: its cleanup runs before the grid's elements are removed,
	// while focus is still in them, and it runs once the new grid's elements
	// are in the document, before the browser paints
	useLayoutEffect(() => {
		const root = rootRef.current;
		if (!ctx || !root) return;
		const { handoff, mount } = ctx;
		const doc = root.ownerDocument;
		const pending = handoff.current;
		handoff.current = null;
		const active = doc.activeElement;
		if (
			pending &&
			pending.mount !== mount &&
			(!active || active === doc.body)
		) {
			const same = find(root, pending);
			if (!same || !tryFocus(same))
				Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).find(
					tryFocus,
				);
		}
		return () => {
			const focused = doc.activeElement;
			if (focused && focused !== root && root.contains(focused))
				handoff.current = locate(root, focused, mount);
		};
	}, [ctx, rootRef]);
};
