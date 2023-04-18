import { useEffect, useState } from "react";
var useListenForChanges = function (getValue) {
    var _a = useState(getValue), val = _a[0], setVal = _a[1];
    useEffect(function () {
        var handle = window.setInterval(function () {
            var newVal = getValue();
            if (newVal !== val) {
                setVal(newVal);
            }
        }, 1000);
        return function () { return window.clearInterval(handle); };
    }, [val, getValue]);
    return val;
};
export default useListenForChanges;
