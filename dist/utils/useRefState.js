import { useCallback, useRef, useState } from "react";
/**
 * Combines and synchronizes useRef and useState
 * @param initialValue The initial value (like useState)
 */
const useRefState = (initialValue) => {
    const ref = useRef(typeof initialValue === "function"
        ? initialValue()
        : initialValue);
    const [state, setState] = useState(initialValue);
    const handleSet = useCallback((newValue) => {
        ref.current =
            typeof newValue === "function"
                ? newValue(ref.current)
                : newValue;
        setState(ref.current);
    }, []);
    const handleGet = useCallback(() => {
        return ref.current;
    }, []);
    return {
        get: handleGet,
        set: handleSet,
        state,
    };
};
export default useRefState;
