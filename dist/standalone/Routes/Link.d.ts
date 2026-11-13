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
     * Called on every click, also with Ctrl, Meta, Shift or Alt, before the
     * link handles it. Calling `evt.preventDefault()` keeps the link from
     * navigating, e.g. to open a dialog instead; skip that for a click with a
     * modifier key to let Ctrl-click still open the href in a new tab.
     */
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}
declare const _default: React.NamedExoticComponent<Omit<LinkProps, "ref"> & React.RefAttributes<HTMLAnchorElement>>;
export default _default;
