import { useEffect, useRef } from "react";
var useDevKeybinds = function (handlers) {
    var matches = useRef({});
    useEffect(function () {
        var keyHandler = function (evt) {
            var _a;
            for (var key in handlers) {
                var matchOffset = (_a = matches.current[key]) !== null && _a !== void 0 ? _a : 0;
                if (key[matchOffset] === evt.key) {
                    if (matchOffset === key.length - 1) {
                        // full match, call handler
                        handlers[key]();
                        matches.current[key] = 0;
                    }
                    else {
                        matches.current[key] = matchOffset + 1;
                    }
                }
                else {
                    matches.current[key] = 0;
                }
            }
        };
        document.addEventListener("keypress", keyHandler);
        return function () {
            document.removeEventListener("keypress", keyHandler);
        };
    }, [handlers]);
};
export default useDevKeybinds;
