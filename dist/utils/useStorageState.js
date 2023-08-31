import { useCallback, useEffect, useState, } from "react";
/**
 * map storageKey -> setState calls
 */
const stateUpdateListeners = {};
/**
 * use persisted & shared state
 * @param storageKey The share/persist key or null to disable this and always return default value
 * @param defaultValue The default value if no data is found or data is invalid
 * @param validateData The function to check if the data that is persisted is valid
 */
export const useLocalStorageState = (storageKey, defaultValue, validateData) => {
    const [state, setState] = useState(() => {
        if (!storageKey)
            return defaultValue;
        // load persisted data
        const value = localStorage.getItem(storageKey);
        if (!value)
            return defaultValue;
        try {
            const data = JSON.parse(value);
            if (validateData(data))
                return data;
            return defaultValue;
        }
        catch (e) {
            return defaultValue;
        }
    });
    // register global state update listeners
    useEffect(() => {
        if (!storageKey)
            return;
        if (!(storageKey in stateUpdateListeners)) {
            stateUpdateListeners[storageKey] = [
                setState,
            ];
        }
        else {
            stateUpdateListeners[storageKey].push(setState);
        }
        return () => {
            stateUpdateListeners[storageKey] = stateUpdateListeners[storageKey].filter((entry) => entry !== setState);
            if (stateUpdateListeners[storageKey].length === 0) {
                delete stateUpdateListeners[storageKey];
            }
        };
    }, [setState, storageKey]);
    // hook setState to call global state update listeners and to persist in localStorage
    const setStateHook = useCallback((newValue) => {
        if (!storageKey)
            return;
        setState((prev) => {
            let updatedValue;
            if (typeof newValue === "function") {
                updatedValue = newValue(prev);
            }
            else {
                updatedValue = newValue;
            }
            localStorage.setItem(storageKey, JSON.stringify(updatedValue));
            return updatedValue;
        });
        if (storageKey in stateUpdateListeners) {
            // storageKey may not be in stateUpdateListeners when the component is unmounted but a reference to this callback is still held
            stateUpdateListeners[storageKey].forEach((hook) => {
                if (hook === setState)
                    return;
                hook(newValue);
            });
        }
    }, [storageKey]);
    return [state, setStateHook];
};
