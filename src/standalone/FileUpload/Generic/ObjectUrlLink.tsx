import React, { useMemo } from "react";
import useObjectUrl from "../../../utils/useObjectUrl";
import getLinkProtocol from "../../../utils/internal/getLinkProtocol";

export interface ObjectUrlLinkProps extends Omit<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	"href"
> {
	/**
	 * The link target: a URL, or a Blob (e.g. a file the user picked)
	 * @remarks Only http(s), blob and data URLs, and URLs relative to the page, are
	 *          linked. A URL with any other scheme (e.g. `javascript:`) or one that is not
	 *          a valid URL renders an anchor without href, which is not a link, in every
	 *          React version.
	 */
	href: string | Blob | null | undefined;
}

/**
 * A link element which also links a Blob
 * @remarks The Blob is linked through an object URL, revoked once href changes or the
 *          link unmounts
 */
const ObjectUrlLink = (props: ObjectUrlLinkProps) => {
	const { href, ...anchorProps } = props;
	const url = useObjectUrl(href);
	const linkUrl = useMemo(
		() => (getLinkProtocol(url) ? url : undefined),
		[url],
	);
	return <a href={linkUrl} {...anchorProps} />;
};

export default React.memo(ObjectUrlLink);
