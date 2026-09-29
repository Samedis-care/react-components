import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import useObjectUrl from "../../../utils/useObjectUrl";
/**
 * An image element which also shows a Blob
 * @remarks The Blob is shown through an object URL, revoked once src changes or the
 *          image unmounts
 */
const ObjectUrlImage = (props) => {
    const { src, alt, ...imgProps } = props;
    const url = useObjectUrl(src);
    return _jsx("img", { src: url, alt: alt, ...imgProps });
};
export default React.memo(ObjectUrlImage);
