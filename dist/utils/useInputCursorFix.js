import { useCallback, useEffect, useRef, useState } from "react";
/**
 * React hook to fix the cursor reset bug for controlled inputs which auto-format values
 * @param newValue The currently passed value (passed to input)
 */
const useInputCursorFix = (newValue) => {
    const [cursor, setCursor] = useState(null);
    const [prevValue, setPrevValue] = useState("");
    const inputRef = useRef(null);
    useEffect(() => {
        if (inputRef.current && cursor) {
            const { current } = inputRef;
            const lenDiff = newValue.length - prevValue.length;
            const curOffset = lenDiff - 1 < 0 ? 0 : lenDiff - 1;
            current.selectionStart =
                cursor[0] === null ? null : cursor[0] + curOffset;
            current.selectionEnd = cursor[1] === null ? null : cursor[1] + curOffset;
            current.selectionDirection = cursor[2];
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newValue]);
    const handleChange = useCallback((event) => {
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
