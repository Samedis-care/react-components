import type { To } from "history";
/**
 * Options of a {@link NavigateFunction} call
 */
export interface NavigateOptions {
    /**
     * Replace the current history entry instead of pushing a new one.
     * Default: false (push)
     */
    replace?: boolean;
    /**
     * State stored with the new history entry, read with
     * `useLocation().state`. Default: none (the state is null)
     */
    state?: unknown;
    /**
     * Keep the scroll position: the navigation leaves the window, the document
     * and the scroll containers of the HistoryRouter (see
     * `useResetScrollOnNavigation`) where they are, instead of scrolling them
     * to the top. For a navigation that keeps the user on the page, such as a
     * tab switch or a filter kept in the URL; RoutedTabs uses it. Also applies
     * when a blocker holds the navigation back and lets it go ahead later.
     * A target with a hash then scrolls to no element, and the focus stays
     * where it is.
     * Default: false (the navigation scrolls them to the top, or to the
     * element the hash of the target names)
     */
    preventScrollReset?: boolean;
}
/**
 * Navigates to `to`, a path of the app or a location object, as
 * {@link useNavigate} describes
 */
export interface NavigateFunction {
    (to: To, options?: NavigateOptions): void;
}
/**
 * Navigate using History API
 *
 * The target is a path of the app (or a location object): leading slashes
 * collapse into one, so `${useRouteInfo().url}/7` goes to "/7" also under a
 * route that matches at the root. A target without a pathname ("?page=2",
 * "#notes", `{ search: "?page=2" }` or the empty "") keeps the current one
 * and, as `history.push` does, drops the search and hash it leaves out: at
 * "/devices?page=1", "" goes to "/devices". A target with a scheme
 * ("https://…", "mailto:…", "javascript:…") throws an Error and nothing
 * happens; leave the app with `window.location` instead.
 *
 * Blockers on the history apply (inside Framework: a form with unsaved
 * changes). Once the navigation happens, the HistoryRouter scrolls the page
 * to the top: the window, the document and the scroll containers registered
 * with `useResetScrollOnNavigation` (PortalLayout's main pane), unless the
 * call passes `preventScrollReset`. A HistoryRouter inside another one (a
 * wizard on a memory history) scrolls only the scroll containers registered
 * with it. A navigation that a blocker cancels keeps the scroll position.
 *
 * A target with a hash ("#details", "/devices/5#notes") then scrolls the
 * element with that id into view and moves the keyboard focus to it, as a
 * link to a fragment does in a browser; when the hash is all it changes,
 * nothing scrolls to the top first. See `HistoryRouter`.
 */
declare const useNavigate: () => NavigateFunction;
export default useNavigate;
