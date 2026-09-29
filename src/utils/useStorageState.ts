import {
	Dispatch,
	SetStateAction,
	useCallback,
	useMemo,
	useSyncExternalStore,
} from "react";

/**
 * map storageKey -> change listeners of the mounted hooks using it
 */
const keyListeners: Record<string, Set<() => void>> = {};

const subscribe = (storageKey: string, onChange: () => void) => {
	(keyListeners[storageKey] ??= new Set()).add(onChange);
	// written in another tab (null: storage cleared)
	const handleStorage = (evt: StorageEvent) => {
		if (evt.key === storageKey || evt.key === null) onChange();
	};
	window.addEventListener("storage", handleStorage);
	return () => {
		keyListeners[storageKey].delete(onChange);
		if (keyListeners[storageKey].size === 0) delete keyListeners[storageKey];
		window.removeEventListener("storage", handleStorage);
	};
};

const noSubscription = () => () => {};

const parse = <T>(
	value: string | null,
	defaultValue: T,
	validateData: (data: unknown) => data is T,
): T => {
	if (!value) return defaultValue;
	try {
		const data: unknown = JSON.parse(value);
		if (validateData(data)) return data;
		return defaultValue;
	} catch {
		return defaultValue;
	}
};

/**
 * Set a useLocalStorageState value from outside the components using it
 * @param storageKey The share/persist key
 * @param defaultValue The current value if no data is found or data is invalid
 * @param validateData The function to check if the data that is persisted is valid
 * @param update The new value, or a function returning it from the current value
 * @remarks The mounted components using the key show the new value at once. A
 *          value written to localStorage directly only shows once they render
 *          again.
 */
export const setLocalStorageState = <T>(
	storageKey: string,
	defaultValue: T,
	validateData: (data: unknown) => data is T,
	update: SetStateAction<T>,
): void => {
	const value =
		typeof update === "function"
			? (update as (prev: T) => T)(
					parse(localStorage.getItem(storageKey), defaultValue, validateData),
				)
			: update;
	localStorage.setItem(storageKey, JSON.stringify(value));
	keyListeners[storageKey]?.forEach((listener) => listener());
};

/**
 * use persisted & shared state
 * @param storageKey The share/persist key or null to disable this and always return default value
 * @param defaultValue The default value if no data is found or data is invalid
 * @param validateData The function to check if the data that is persisted is valid
 * @remarks The state is what localStorage holds, so it is shared with every
 *          other component and browser tab using the key. A functional update
 *          gets the stored value.
 * @see setLocalStorageState
 */
export const useLocalStorageState = <T>(
	storageKey: string | null | undefined,
	defaultValue: T,
	validateData: (data: unknown) => data is T,
): [T, Dispatch<SetStateAction<T>>] => {
	const subscribeToKey = useCallback(
		(onChange: () => void) =>
			storageKey ? subscribe(storageKey, onChange) : noSubscription(),
		[storageKey],
	);
	const stored = useSyncExternalStore(subscribeToKey, () =>
		storageKey ? localStorage.getItem(storageKey) : null,
	);
	// defaultValue and validateData only apply when the stored value changes, so
	// callers can pass them inline
	const state = useMemo(
		() => parse(stored, defaultValue, validateData),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[stored, storageKey],
	);

	const setState = useCallback(
		(update: SetStateAction<T>) => {
			if (!storageKey) return;
			setLocalStorageState(storageKey, defaultValue, validateData, update);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[storageKey],
	);

	return [state, setState];
};
