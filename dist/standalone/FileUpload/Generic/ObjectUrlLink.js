import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import useObjectUrl from "../../../utils/useObjectUrl";
import getLinkProtocol from "../../../utils/internal/getLinkProtocol";
/**
 * A link element which also links a Blob
 * @remarks The Blob is linked through an object URL, revoked once href changes or the
 *          link unmounts
 */
const ObjectUrlLink = (props) => {
    const { href, ...anchorProps } = props;
    const url = useObjectUrl(href);
    const linkUrl = useMemo(() => (getLinkProtocol(url) ? url : undefined), [url]);
    return _jsx("a", { href: linkUrl, ...anchorProps });
};
export default React.memo(ObjectUrlLink);
