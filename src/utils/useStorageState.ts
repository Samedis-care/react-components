import {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from "react";

/**
 * map storageKey -> setState calls
 */
const stateUpdateListeners: Record<
	string,
	Dispatch<SetStateAction<unknown>>[]
> = {};

/**
 * use persisted & shared state
 * @param storageKey The share/persist key or null to disable this and always return default value
 * @param defaultValue The default value if no data is found or data is invalid
 * @param validateData The function to check if the data that is persisted is valid
 */
export const useLocalStorageState = <T>(
	storageKey: string | null | undefined,
	defaultValue: T,
	validateData: (data: unknown) => data is T,
): [T, Dispatch<SetStateAction<T>>] => {
	const [state, setState] = useState<T>(() => {
		if (!storageKey) return defaultValue;

		// load persisted data
		const value = localStorage.getItem(storageKey);
		if (!value) return defaultValue;
		try {
			const data: unknown = JSON.parse(value);
			if (validateData(data)) return data;
			return defaultValue;
		} catch {
			return defaultValue;
		}
	});

	// register global state update listeners
	useEffect(() => {
		if (!storageKey) return;

		if (!(storageKey in stateUpdateListeners)) {
			stateUpdateListeners[storageKey] = [
				setState as Dispatch<SetStateAction<unknown>>,
			];
		} else {
			stateUpdateListeners[storageKey].push(
				setState as Dispatch<SetStateAction<unknown>>,
			);
		}

		return () => {
			stateUpdateListeners[storageKey] = stateUpdateListeners[
				storageKey
			].filter((entry) => entry !== setState);
			if (stateUpdateListeners[storageKey].length === 0) {
				delete stateUpdateListeners[storageKey];
			}
		};
	}, [setState, storageKey]);

	// hook setState to call global state update listeners and to persist in localStorage
	const setStateHook = useCallback(
		(newValue: SetStateAction<T>) => {
			if (!storageKey) return;
			setState((prev) => {
				let updatedValue: T;
				if (typeof newValue === "function") {
					updatedValue = (newValue as (prev: T) => T)(prev);
				} else {
					updatedValue = newValue;
				}
				localStorage.setItem(storageKey, JSON.stringify(updatedValue));
				return updatedValue;
			});
			if (storageKey in stateUpdateListeners) {
				// storageKey may not be in stateUpdateListeners when the component is unmounted but a reference to this callback is still held
				stateUpdateListeners[storageKey].forEach((hook) => {
					if (hook === setState) return;
					hook(newValue);
				});
			}
		},
		[storageKey],
	);

	return [state, setStateHook];
};
