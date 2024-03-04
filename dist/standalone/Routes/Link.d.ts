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
}
declare const _default: React.MemoExoticComponent<(props: LinkProps) => React.JSX.Element>;
export default _default;
