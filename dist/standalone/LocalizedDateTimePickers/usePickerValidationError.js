import { useCallback, useRef, useState } from "react";
/**
 * Follows MUI's own validation result for a picker.
 *
 * MUI marks the field invalid from its validation (`minDate`, an impossible
 * date, …) inside the field, and tells the outside about it only through
 * `onError`, which it calls whenever the error changes. The wrappers need the
 * state to put it on the sections, so they hand the picker this handler in
 * place of the consumer's.
 * @param onError The consumer's `onError`, if any. The latest one is called.
 * @returns The validation state and the handler to pass to the picker
 */
const usePickerValidationError = (onError) => {
    const [hasValidationError, setHasValidationError] = useState(false);
    const onErrorRef = useRef(onError);
    onErrorRef.current = onError;
    const handleError = useCallback((error, value) => {
        // a single value's error is `null` when valid, as in MUI's value manager
        setHasValidationError(error != null);
        onErrorRef.current?.(error, value);
    }, []);
    return { hasValidationError, onError: handleError };
};
export default usePickerValidationError;
