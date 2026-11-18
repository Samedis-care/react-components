import React from "react";
import { type To } from "history";
export interface LinkProps extends Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "href"> {
    /**
     * Target location: a path of the app or a location object. Leading slashes
     * collapse into one, as with `useNavigate`: "//7" links to "/7".
     * A URL with a scheme ("https://…", "mailto:…") makes a plain link that
     * the browser follows; `replace` and `state` don't apply to it.
     */
    to: To;
    /**
     * Replace the current history entry?
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
