import { useEffect } from "react";
/**
 * Debug utility for logging mounts/unmounts
 */
var useMountLogging = function (comp) {
    var name = comp.name;
    useEffect(function () {
        // eslint-disable-next-line no-console
        console.log(name, "mounted");
        return function () {
            // eslint-disable-next-line no-console
            console.log(name, "unmounted");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};
export default useMountLogging;
