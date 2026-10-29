import { useEffect, useRef, useState } from "react";
import debouncePromise, {
	DebouncePromiseFunc,
} from "../../utils/debouncePromise";

/**
 * Debounces a backend selector's load handler with one debouncer per mount
 * @param load The load handler. The debouncer calls the one passed last, so a handler that
 *        is new on every render (from an inline sort or modelToSelectorData) neither
 *        restarts the debounce nor changes the returned function.
 * @param timeout The debounce time in ms; a new one applies from the next call
 * @returns The debounced handler, the same function for as long as the component is
 *          mounted. A call still waiting for the debounce when the component unmounts is
 *          dropped: nothing is loaded, and its promise never settles.
 */
const useDebouncedLoad = <ArgT extends Array<unknown>, RetT>(
	load: DebouncePromiseFunc<ArgT, RetT>,
	timeout: number,
): DebouncePromiseFunc<ArgT, RetT> => {
	const loadRef = useRef(load);
	loadRef.current = load;
	const timeoutRef = useRef(timeout);
	timeoutRef.current = timeout;
	const [debounced] = useState(() =>
		debouncePromise(
			(...args: ArgT) => loadRef.current(...args),
			() => timeoutRef.current,
		),
	);
	useEffect(() => () => debounced.cancel(), [debounced]);
	return debounced;
};

export default useDebouncedLoad;
