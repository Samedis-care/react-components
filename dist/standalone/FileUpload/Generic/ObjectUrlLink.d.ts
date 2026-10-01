import React from "react";
export interface ObjectUrlLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    /**
     * The link target: a URL, or a Blob (e.g. a file the user picked)
     */
    href: string | Blob | null | undefined;
}
declare const _default: React.MemoExoticComponent<(props: ObjectUrlLinkProps) => React.JSX.Element>;
export default _default;
