import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import React, { useEffect } from "react";
const MobileScalingFix = (props) => {
    const { minWidth } = props;
    useEffect(() => {
        let meta = document.querySelector("meta[name='viewport']");
        let metaContent = "width=" +
            (minWidth ? minWidth.toFixed() : "device-width") +
            ", initial-scale=1";
        if (["iPhone", "iPod"].find((device) => navigator.platform.includes(device))) {
            metaContent += ", maximum-scale=1"; // prevent scaling in on inputs
        }
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "viewport";
            document.head.appendChild(meta);
        }
        meta.content = metaContent;
    }, [minWidth]);
    return _jsx(_Fragment, {});
};
export default React.memo(MobileScalingFix);
