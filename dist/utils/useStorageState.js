import { useCallback, useEffect, useState, } from "react";
/**
 * map storageKey -> setState calls
 */
var stateUpdateListeners = {};
/**
 * use persisted & shared state
 * @param storageKey The share/persist key or null to disable this and always return default value
 * @param defaultValue The default value if no data is found or data is invalid
 * @param validateData The function to check if the data that is persisted is valid
 */
export var useLocalStorageState = function (storageKey, defaultValue, validateData) {
    var _a = useState(function () {
        if (!storageKey)
            return defaultValue;
        // load persisted data
        var value = localStorage.getItem(storageKey);
        if (!value)
            return defaultValue;
        try {
            var data = JSON.parse(value);
            if (validateData(data))
                return data;
            return defaultValue;
        }
        catch (e) {
            return defaultValue;
        }
    }), state = _a[0], setState = _a[1];
    // register global state update listeners
    useEffect(function () {
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
        return function () {
            stateUpdateListeners[storageKey] = stateUpdateListeners[storageKey].filter(function (entry) { return entry !== setState; });
            if (stateUpdateListeners[storageKey].length === 0) {
                delete stateUpdateListeners[storageKey];
            }
        };
    }, [setState, storageKey]);
    // hook setState to call global state update listeners and to persist in localStorage
    var setStateHook = useCallback(function (newValue) {
        if (!storageKey)
            return;
        setState(function (prev) {
            var updatedValue;
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
            stateUpdateListeners[storageKey].forEach(function (hook) {
                if (hook === setState)
                    return;
                hook(newValue);
            });
        }
    }, [storageKey]);
    return [state, setStateHook];
};
