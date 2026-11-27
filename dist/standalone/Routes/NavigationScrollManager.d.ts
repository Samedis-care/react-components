import type { RefObject } from "react";
import { type History, type Location, type To, type Update } from "history";
/**
 * Sets the scroll positions after the navigations of one HistoryRouter:
 * - A push or replace scrolls the window, the document and the registered
 *   scroll containers to the top, unless useNavigate started it with
 *   `preventScrollReset`. The one of a HistoryRouter inside another one
 *   scrolls only the registered scroll containers, which are part of its
 *   content: the window and the document belong to the page around it.
 * - One to a location with a hash then scrolls the element the hash names into
 *   view and focuses it, once the location has rendered. When the hash is all
 *   it changes, nothing scrolls to the top first, as a link to a fragment of
 *   the page in a browser.
 * - Back/forward navigations leave the scroll positions alone.
 *
 * HistoryRouter owns one and reports the navigations that happen; useNavigate
 * reports the navigations it starts, NavigationScroll the locations rendered,
 * and useResetScrollOnNavigation registers the containers.
 */
export declare class NavigationScrollManager {
    private readonly containers;
    /**
     * The URL a navigation with `preventScrollReset` goes to, from the call
     * that starts it until the next navigation happens: a blocker (the leave
     * guard of a form) may hold it back and let it go ahead later, to the same
     * URL
     */
    private keepScrollAt;
    /**
     * The location the router rendered last: the page on screen
     */
    private shown;
    /**
     * The fragment the last navigation leads to, from the navigation until its
     * location renders, and whether the navigation stays on the page (changes
     * the hash only)
     */
    private anchor;
    /**
     * Resets the scroll position of a container after each navigation that
     * resets the window's
     * @param ref The container
     * @returns Removes the container again
     */
    register(ref: RefObject<HTMLElement | null>): () => void;
    /**
     * A navigation starts, before it reaches the history (which may block it)
     * @param history The history it navigates
     * @param to Its target, as passed to the history
     * @param preventScrollReset Does it keep the scroll positions?
     */
    navigating(history: History, to: To, preventScrollReset: boolean): void;
    /**
     * A navigation happened, before it renders (a blocked one never gets
     * here): resets the scroll positions unless it is a back/forward
     * navigation, the one started with `preventScrollReset`, or one that
     * changes the hash only; for one to a hash, rendered scrolls to its
     * element
     * @param update The navigation
     * @param nested Is the router inside another one? Then it resets only the
     * registered scroll containers, not the window and the document.
     */
    navigated(update: Update, nested: boolean): void;
    /**
     * A location rendered, in a layout effect after those of the router's
     * children and before the focus check of NavigationFocus: when a
     * navigation to a hash led to it, scrolls the element the hash names into
     * view (the window and the scroll containers around it) and moves the
     * focus to it. A hash that names no element leaves the page where the
     * navigation left it: at the top, or where it was when only the hash
     * changed; "#top" scrolls to the top then.
     * @param location The location the router rendered
     * @param nested Is the router inside another one? Then "#top" scrolls only
     * the registered scroll containers to the top.
     */
    rendered(location: Location, nested: boolean): void;
    /**
     * Scrolls the window, the document and the registered scroll containers
     * to the top
     * @param nested Is the router inside another one? Then only the registered
     * scroll containers: the window and the document belong to the page
     * around it.
     */
    private scrollToTop;
}
