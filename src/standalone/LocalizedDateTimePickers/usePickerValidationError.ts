import { useCallback, useRef, useState } from "react";

export interface PickerValidationErrorResult<TError, TValue> {
	/** Whether MUI's own validation rejects the value the field shows */
	hasValidationError: boolean;
	/**
	 * MUI's validation error while it is to be shown as text, `null` otherwise.
	 * An error that comes up while the user is in the field is held back until
	 * focus leaves it, so a year typed through 0002, 0020 and 0202 does not flash
	 * a message on every keystroke; an error that comes up while the user is
	 * elsewhere (a date set from outside, a changed `minDate`) is shown at once.
	 * Once shown, it follows the error while the user edits, and it goes as soon
	 * as the value is valid.
	 */
	shownError: TError | null;
	/**
	 * The `onError` to hand to the picker: records the state and calls the
	 * consumer's `onError` with the same arguments
	 */
	onError: (error: TError, value: TValue) => void;
	/** To be called whenever focus enters the field */
	onFieldFocus: () => void;
	/** To be called once focus leaves the field (see `useFieldBlur`) */
	onFieldLeave: () => void;
}

interface ValidationState<TError> {
	/** MUI's current error, `null` while the value is valid */
	error: TError | null;
	/** Whether that error is shown as text */
	shown: boolean;
}

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
const usePickerValidationError = <TError, TValue>(
	onError: ((error: TError, value: TValue) => void) | undefined,
): PickerValidationErrorResult<TError, TValue> => {
	const [state, setState] = useState<ValidationState<TError>>({
		error: null,
		shown: false,
	});
	const onErrorRef = useRef(onError);
	onErrorRef.current = onError;
	const focusedRef = useRef(false);

	const handleError = useCallback((error: TError, value: TValue) => {
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
		setState((prev) =>
			prev.error != null && !prev.shown ? { ...prev, shown: true } : prev,
		);
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
