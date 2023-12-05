import { useEffect, useState } from "react";
import { useFormContext } from "./Form";
/**
 * useState, but persisted in the form state so it survives remounts
 * @param name A unique name
 * @param initialState Initial state
 * @see setState, useFormContext => getCustomState, setCustomState
 * @remarks This is only to be used to survive remounts, this does not work to sync the state of two components!
 */
const useFormState = (name, initialState) => {
    const { getCustomState, setCustomState } = useFormContext();
    const statePack = useState(() => getCustomState(name) ??
        (typeof initialState === "function"
            ? initialState()
            : initialState));
    const [state] = statePack;
    useEffect(() => {
        setCustomState(name, () => state);
    }, [name, setCustomState, state]);
    return statePack;
};
export default useFormState;
