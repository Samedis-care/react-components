import React from "react";
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
export declare const ListFocusKeeperContext: React.Context<ListFocusKeeper | null>;
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
declare const useListFocusKeeper: (getList: () => HTMLElement | null) => {
    keeper: ListFocusKeeper;
    onFocus: (evt: React.FocusEvent<HTMLElement>) => void;
    onBlur: (evt: React.FocusEvent<HTMLElement>) => void;
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
export declare const useListFocusTarget: (key: string) => (element: HTMLElement | null) => void;
export default useListFocusKeeper;
