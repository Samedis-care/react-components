import React, { useCallback, useEffect, useRef, useState } from "react";

export interface InputCursorFixHook {
	/**
	 * to be called in the inputs onChange handler
	 * @param event The on change event
	 */
	handleCursorChange: (
		event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	/**
	 * Has to be passed to the input ref prop
	 */
	cursorInputRef: React.RefObject<HTMLInputElement | null>;
}

/**
 * React hook to fix the cursor reset bug for controlled inputs which auto-format values
 * @param newValue The currently passed value (passed to input)
 */
const useInputCursorFix = (newValue: string): InputCursorFixHook => {
	const [cursor, setCursor] = useState<
		| [
				HTMLInputElement["selectionStart"],
				HTMLInputElement["selectionEnd"],
				HTMLInputElement["selectionDirection"],
		  ]
		| null
	>(null);
	const [prevValue, setPrevValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

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

	const handleChange = useCallback(
		(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setCursor([
				event.target.selectionStart,
				event.target.selectionEnd,
				event.target.selectionDirection,
			]);
			setPrevValue(newValue);
		},
		[setCursor, setPrevValue, newValue],
	);

	return {
		handleCursorChange: handleChange,
		cursorInputRef: inputRef,
	};
};

export default useInputCursorFix;
