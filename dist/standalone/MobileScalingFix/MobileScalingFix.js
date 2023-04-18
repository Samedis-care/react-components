import React, { useEffect } from "react";
var MobileScalingFix = function () {
    useEffect(function () {
        var meta = document.querySelector("meta[name='viewport']");
        var metaContent = "width=device-width, initial-scale=1";
        if (["iPhone", "iPod"].find(function (device) { return navigator.platform.includes(device); })) {
            metaContent += ", maximum-scale=1"; // prevent scaling in on inputs
        }
        if (!meta) {
            meta = document.createElement("meta");
            meta.name = "viewport";
            document.head.appendChild(meta);
        }
        meta.content = metaContent;
    }, []);
    return React.createElement(React.Fragment, null);
};
export default React.memo(MobileScalingFix);
