import { useEffect, useMemo, useState } from "react";
import { debounce } from "./index";
var getWindowSize = function () {
    return [window.innerWidth, window.innerHeight];
};
var useWindowSize = function () {
    var _a = useState(getWindowSize), size = _a[0], setSize = _a[1];
    var handleResize = useMemo(function () {
        return debounce(function () {
            setSize(getWindowSize);
        }, 100);
    }, []);
    useEffect(function () {
        addEventListener("resize", handleResize);
        return function () {
            removeEventListener("resize", handleResize);
        };
    }, [handleResize]);
    return size;
};
export default useWindowSize;
