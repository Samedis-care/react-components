import { useCallback, useEffect, useRef, useState } from "react";
/**
 * React hook to fix the cursor reset bug for controlled inputs which auto-format values
 * @param newValue The currently passed value (passed to input)
 */
var useInputCursorFix = function (newValue) {
    var _a = useState(null), cursor = _a[0], setCursor = _a[1];
    var _b = useState(""), prevValue = _b[0], setPrevValue = _b[1];
    var inputRef = useRef(null);
    useEffect(function () {
        if (inputRef.current && cursor) {
            var current = inputRef.current;
            var lenDiff = newValue.length - prevValue.length;
            var curOffset = lenDiff - 1 < 0 ? 0 : lenDiff - 1;
            current.selectionStart =
                cursor[0] === null ? null : cursor[0] + curOffset;
            current.selectionEnd = cursor[1] === null ? null : cursor[1] + curOffset;
            current.selectionDirection = cursor[2];
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newValue]);
    var handleChange = useCallback(function (event) {
        setCursor([
            event.target.selectionStart,
            event.target.selectionEnd,
            event.target.selectionDirection,
        ]);
        setPrevValue(newValue);
    }, [setCursor, setPrevValue, newValue]);
    return {
        handleCursorChange: handleChange,
        cursorInputRef: inputRef,
    };
};
export default useInputCursorFix;
