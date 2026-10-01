import React from "react";
import useObjectUrl from "../../../utils/useObjectUrl";

export interface ObjectUrlLinkProps extends Omit<
	React.AnchorHTMLAttributes<HTMLAnchorElement>,
	"href"
> {
	/**
	 * The link target: a URL, or a Blob (e.g. a file the user picked)
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
	return <a href={url} {...anchorProps} />;
};

export default React.memo(ObjectUrlLink);
