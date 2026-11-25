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
     * as "?page=2") keeps the current one; a target that leaves out `search` or
     * `hash` drops them, as a push does: at "/devices?page=1",
     * `{ search: "?page=2" }` and "?page=2" link to "/devices?page=2", and
     * `{ hash: "#notes" }` and "#notes" to "/devices#notes".
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
}
declare const _default: React.NamedExoticComponent<Omit<LinkProps, "ref"> & React.RefAttributes<HTMLAnchorElement>>;
export default _default;
