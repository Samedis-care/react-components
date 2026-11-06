import React from "react";
export interface ObjectUrlLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    /**
     * The link target: a URL, or a Blob (e.g. a file the user picked)
     * @remarks Only http(s), blob and data URLs, and URLs relative to the page, are
     *          linked. A URL with any other scheme (e.g. `javascript:`) or one that is not
     *          a valid URL renders an anchor without href, which is not a link, in every
     *          React version.
     */
    href: string | Blob | null | undefined;
}
declare const _default: React.MemoExoticComponent<(props: ObjectUrlLinkProps) => React.JSX.Element>;
export default _default;
