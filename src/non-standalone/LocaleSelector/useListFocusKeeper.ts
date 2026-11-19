import React, { useCallback, useContext, useMemo, useRef } from "react";

/**
 * What the rows of the locale list report to the list, so that keyboard focus
 * stays in it while it scrolls (see {@link useListFocusKeeper})
 */
export interface ListFocusKeeper {
	/**
	 * A row's focusable element was rendered (attached to the document)
	 * @param key The row's key (its locale)
	 * @param element The element
	 */
	rendered: (key: string, element: HTMLElement) => void;
	/**
	 * A row's focusable element is being unrendered; it is still in the document
	 * @param key The row's key (its locale)
	 * @param element The element
	 */
	unrendering: (key: string, element: HTMLElement) => void;
}

/**
 * The keeper of the list the rows are rendered in; `null` outside of one
 */
export const ListFocusKeeperContext =
	React.createContext<ListFocusKeeper | null>(null);

/**
 * Keeps keyboard focus in a virtualized list, whose rows are unrendered when
 * they leave the rendered range. When the row that has focus is unrendered
 * (the list scrolled: the wheel, a swipe, or the arrow and page keys, which
 * scroll it natively), the browser drops focus to the page. The list takes it
 * instead, without scrolling, so the keys keep scrolling the list. When that
 * row is rendered again while the list still has focus, the row gets it back.
 * A row that is rendered anew in the same update (a new element for the same
 * key) takes it over at once. Focus that moved on meanwhile (to another row, or
 * out of the list) stays where it is.
 *
 * The rows report their focusable element with {@link useListFocusTarget},
 * under {@link ListFocusKeeperContext} with the returned `keeper`.
 * @param getList Returns the list's element, or null while it is not rendered.
 * The element must be focusable (`tabindex="-1"`), and get the returned
 * `onFocus` and `onBlur`.
 * @return The keeper for {@link ListFocusKeeperContext}, and the focus handlers
 * for the list's element
 */
const useListFocusKeeper = (getList: () => HTMLElement | null) => {
	const getListRef = useRef(getList);
	getListRef.current = getList;
	// the key of the row whose element had focus when it was unrendered, while
	// focus waits on the list for it
	const lostRef = useRef<string | null>(null);

	const keeper = useMemo<ListFocusKeeper>(
		() => ({
			rendered: (key, element) => {
				if (lostRef.current !== key) return;
				const doc = element.ownerDocument;
				const active = doc.activeElement;
				if (active === element) {
					lostRef.current = null;
					return;
				}
				// focus waits on the list, or the browser dropped it to the page in
				// this update, when the row's previous element was removed
				if (active && active !== doc.body && active !== getListRef.current())
					return;
				lostRef.current = null;
				element.focus({ preventScroll: true });
			},
			unrendering: (key, element) => {
				const doc = element.ownerDocument;
				if (!element.contains(doc.activeElement)) return;
				lostRef.current = key;
				// once the update is done: the row may have been rendered anew
				// meanwhile, and taken focus over, or only hidden, keeping its element
				queueMicrotask(() => {
					if (lostRef.current !== key || element.isConnected) return;
					const active = doc.activeElement;
					if (active && active !== doc.body) return;
					const list = getListRef.current();
					if (list?.isConnected) list.focus({ preventScroll: true });
				});
			},
		}),
		[],
	);

	// a row took focus: no row is waited for anymore
	const onFocus = useCallback((evt: React.FocusEvent<HTMLElement>) => {
		if (evt.target !== evt.currentTarget) lostRef.current = null;
	}, []);
	// focus moved out of the list, to another element: the row is not waited for
	// anymore (a window that loses focus has no next element, and keeps waiting)
	const onBlur = useCallback((evt: React.FocusEvent<HTMLElement>) => {
		const next = evt.relatedTarget;
		if (next && !evt.currentTarget.contains(next)) lostRef.current = null;
	}, []);

	return { keeper, onFocus, onBlur };
};

/**
 * The ref callback for a row's focusable element, which reports it to the list
 * (see {@link useListFocusKeeper}): when the row is unrendered while it has
 * keyboard focus, the list takes focus, and gives it back to the row when it is
 * rendered again
 * @param key The row's key, the same every time the row is rendered (its
 * locale)
 * @return The ref callback
 */
export const useListFocusTarget = (key: string) => {
	const keeper = useContext(ListFocusKeeperContext);
	const elementRef = useRef<HTMLElement | null>(null);
	return useCallback(
		(element: HTMLElement | null) => {
			const previous = elementRef.current;
			elementRef.current = element;
			if (!keeper || previous === element) return;
			if (previous) keeper.unrendering(key, previous);
			if (element) keeper.rendered(key, element);
		},
		[keeper, key],
	);
};

export default useListFocusKeeper;
