/**
 * Moves the keyboard focus to a container that is not focusable otherwise, e.g. the
 * container of content that just replaced the part of the page the focus was in. It gets
 * `tabindex="-1"` for as long as it has the focus, so it is never a tab stop, and the next
 * Tab goes to its first control. A pointer press inside takes that away before the browser
 * moves the focus, so a click on blank space leaves the focus where it would without the
 * container, and the next Tab goes on from the point clicked.
 * @param container The container. Give it no `tabIndex` of its own and no focus ring.
 * @remarks Leaves the container as it was if it cannot take the focus (e.g. it is hidden).
 *          Does not scroll: the focus is moved with `preventScroll`.
 */
declare const focusContainer: (container: HTMLElement) => void;
export default focusContainer;
