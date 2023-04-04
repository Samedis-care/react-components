import { Dispatch, SetStateAction } from "react";
/**
 * use persisted & shared state
 * @param storageKey The share/persist key or null to disable this and always return default value
 * @param defaultValue The default value if no data is found or data is invalid
 * @param validateData The function to check if the data that is persisted is valid
 */
export declare const useLocalStorageState: <T>(storageKey: string | null | undefined, defaultValue: T, validateData: (data: unknown) => data is T) => [T, Dispatch<SetStateAction<T>>];
