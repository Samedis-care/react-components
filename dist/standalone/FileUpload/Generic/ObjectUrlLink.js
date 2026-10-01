import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import useObjectUrl from "../../../utils/useObjectUrl";
/**
 * A link element which also links a Blob
 * @remarks The Blob is linked through an object URL, revoked once href changes or the
 *          link unmounts
 */
const ObjectUrlLink = (props) => {
    const { href, ...anchorProps } = props;
    const url = useObjectUrl(href);
    return _jsx("a", { href: url, ...anchorProps });
};
export default React.memo(ObjectUrlLink);
