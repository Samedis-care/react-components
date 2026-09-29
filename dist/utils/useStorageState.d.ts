import { Dispatch, SetStateAction } from "react";
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
export declare const setLocalStorageState: <T>(storageKey: string, defaultValue: T, validateData: (data: unknown) => data is T, update: SetStateAction<T>) => void;
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
export declare const useLocalStorageState: <T>(storageKey: string | null | undefined, defaultValue: T, validateData: (data: unknown) => data is T) => [T, Dispatch<SetStateAction<T>>];
