import React from "react";
import type { To } from "history";
export interface LinkProps extends Omit<React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "href"> {
    /**
     * Target location
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
