import React from "react";
import { type To } from "history";
/**
 * Props of {@link Link}: the target and every `<a>` attribute except `href`,
 * which Link computes from `to`
 */
export interface LinkProps extends Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "href"> {
    /**
     * Target location: a path of the app or a location object. Leading slashes
     * collapse into one, as with `useNavigate`: "//7" links to "/7".
     * A target that leaves out `pathname` (a location object, or a string such
     * as "?page=2" or the empty "") keeps the current one; a target that leaves
     * out `search` or `hash` drops them, as a push does: at "/devices?page=1",
     * `{ search: "?page=2" }` and "?page=2" link to "/devices?page=2",
     * `{ hash: "#notes" }` and "#notes" to "/devices#notes", and "" to
     * "/devices".
     * A target with a hash scrolls the element with that id into view and
     * moves the keyboard focus to it, as a link to a fragment does in a
     * browser: `to="#main"` makes a skip link, see `HistoryRouter`.
     * A URL with a scheme ("https://…", "mailto:…") makes a plain link that
     * the browser follows; `replace` and `state` don't apply to it.
     */
    to: To;
    /**
     * Replace the current history entry instead of pushing a new one.
     * Default: replace when the link leads to the current location (the same
     * pathname, search and hash, see `to`), so a click on the link of the
     * current page adds no second entry for it; push otherwise. `false` always
     * pushes, `true` always replaces.
     */
    replace?: boolean;
    /**
     * Target location state (passed to history API)
     */
    state?: unknown;
    /**
     * Keep the scroll position when the link navigates: the window and the
     * scroll containers of the HistoryRouter stay where they are, for a link
     * that keeps the user on the page (a tab, a filter). See the
     * `preventScrollReset` option of `useNavigate`. A target with a hash then
     * scrolls to no element, and the focus stays on the link.
     * Default: false (the navigation scrolls them to the top, or to the
     * element the hash of `to` names)
     */
    preventScrollReset?: boolean;
    /**
     * Where the browser opens the link. A target other than `_self`
     * (`_blank`, a window name) leaves a click to the browser, which opens the
     * href there; `replace` and `state` don't apply. An empty target or
     * `_self` routes as usual. Default: none (the current tab)
     */
    target?: React.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    /**
     * Downloads the href instead of opening it: `true`, or the file name to
     * save it as. A click is then left to the browser, which downloads it.
     * Default: none (no download)
     */
    download?: React.AnchorHTMLAttributes<HTMLAnchorElement>["download"];
    /**
     * Called on every click, also with Ctrl, Meta, Shift or Alt, before the
     * link handles it. Calling `evt.preventDefault()` keeps the link from
     * navigating, e.g. to open a dialog instead; skip that for a click with a
     * modifier key to let Ctrl-click still open the href in a new tab.
     */
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    /**
     * Marks the link with `aria-current` while it leads to the current page, so
     * screen readers announce it as the current one and styles can select it
     * (`&[aria-current="page"]`): for the links of a navigation or a
     * breadcrumb trail. `true` and `"page"` set `aria-current="page"`;
     * `"step"` (a step of a process) and `"location"` (a part of the page, such
     * as an entry of a table of contents that links to `#notes`) set that token
     * instead.
     * The link leads to the current page while the location has the pathname
     * of the target (completed as described at `to`), the search params the
     * target names, with the same values, and the hash the target names, if
     * it names one. A target without search or hash leaves them out of the
     * comparison. At "/devices?page=2&sort=name#notes", "/devices",
     * "/devices?page=2", "?page=2" and "#notes" are marked, but "/devices/5",
     * "/" (pages below and above it), "/devices?page=1" and "/devices#other"
     * are not. Pathname, search and hash are compared as the URL parser reads
     * them, as for `replace`. A URL with a scheme is never marked. The mark
     * follows the location.
     * An `aria-current` passed to the link is used instead.
     * Default: `false` (no `aria-current` unless one is passed)
     */
    markCurrent?: boolean | "page" | "step" | "location";
}
declare const _default: React.NamedExoticComponent<Omit<LinkProps, "ref"> & React.RefAttributes<HTMLAnchorElement>>;
export default _default;
