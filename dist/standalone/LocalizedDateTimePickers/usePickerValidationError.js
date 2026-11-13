import { useCallback, useRef, useState } from "react";
/**
 * Follows MUI's own validation result for a picker.
 *
 * MUI marks the field invalid from its validation (`minDate`, an impossible
 * date, …) inside the field, and tells the outside about it only through
 * `onError`, which it calls whenever the error changes. The wrappers need the
 * state to put it on the sections and to say in text what is wrong, so they
 * hand the picker this handler in place of the consumer's.
 * @param onError The consumer's `onError`, if any. The latest one is called.
 * @returns The validation state and the handlers to pass to the picker
 */
const usePickerValidationError = (onError) => {
    const [state, setState] = useState({
        error: null,
        shown: false,
    });
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    const focusedRef = useRef(false);
    const handleError = useCallback((error, value) => {
        // a single value's error is `null` when valid, as in MUI's value manager
        const invalid = error != null;
        const focused = focusedRef.current;
        setState((prev) => ({
            error: invalid ? error : null,
            shown: invalid && (prev.shown || !focused),
        }));
        onErrorRef.current?.(error, value);
    }, []);
    const onFieldFocus = useCallback(() => {
        focusedRef.current = true;
    }, []);
    const onFieldLeave = useCallback(() => {
        focusedRef.current = false;
        setState((prev) => prev.error != null && !prev.shown ? { ...prev, shown: true } : prev);
    }, []);
    return {
        hasValidationError: state.error != null,
        shownError: state.shown ? state.error : null,
        onError: handleError,
        onFieldFocus,
        onFieldLeave,
    };
};
export default usePickerValidationError;
