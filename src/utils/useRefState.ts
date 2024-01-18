import React, { Dispatch, useCallback, useRef, useState } from "react";

interface UseRefStateResult<T> {
	/**
	 * get ref value
	 */
	get: () => T;
	/**
	 * set ref/state value
	 */
	set: Dispatch<React.SetStateAction<T>>;
	/**
	 * state value
	 */
	state: T; // exposed from state
}

/**
 * Combines and synchronizes useRef and useState
 * @param initialValue The initial value (like useState)
 */
const useRefState = <T>(initialValue: T | (() => T)): UseRefStateResult<T> => {
	const ref = useRef<T>(
		typeof initialValue === "function"
			? (initialValue as () => T)()
			: initialValue
	);
	const [state, setState] = useState<T>(ref.current);
	const handleSet = useCallback((newValue: T | ((prev: T) => T)) => {
		ref.current =
			typeof newValue === "function"
				? (newValue as (prev: T) => T)(ref.current)
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
