import { useCallback, useEffect, useState, } from "react";
import { useFormContextLite } from "./Form";
/**
 * useState, but persisted in the form state so it survives remounts
 * @param name A unique name, the state is stored under it. Another name is another state:
 *        when the name changes, the hook shows what is stored under the new name (or
 *        initialState) and the old name keeps its own.
 * @param initialState Initial state (or a function returning it), used when nothing is
 *        stored under the name yet. A stored null or undefined is restored like any
 *        other value.
 * @returns The state and its setter, like useState. The setter is the same function for
 *          the life of the component and sets the state of the current name.
 * @see useFormContextLite => getCustomState, setCustomState, hasCustomState
 * @remarks Reads the form's lite context, which does not change with the form's values,
 *          so the component does not render again while the user types into a field.
 * @remarks This is only to be used to survive remounts, this does not work to sync the state of two components!
 * @remarks The name shares one namespace with getCustomState / setCustomState and with
 *          the nestedFormName of nested forms: don't reuse those names.
 * @remarks Must be used inside a Form; the state lives as long as the Form, across record
 *          changes.
 */
const useFormState = (name, initialState) => {
    const { getCustomState, setCustomState, hasCustomState } = useFormContextLite();
    const restore = () => hasCustomState(name)
        ? getCustomState(name)
        : typeof initialState === "function"
            ? initialState()
            : initialState;
    const [entry, setEntry] = useState(() => ({ name, state: restore() }));
    let current = entry;
    if (entry.name !== name) {
        // another name is another state
        current = { name, state: restore() };
        setEntry(current);
    }
    const setState = useCallback((action) => setEntry((prev) => {
        const state = typeof action === "function"
            ? action(prev.state)
            : action;
        return Object.is(state, prev.state) ? prev : { name: prev.name, state };
    }), []);
    useEffect(() => {
        setCustomState(entry.name, () => entry.state);
    }, [entry, setCustomState]);
    return [current.state, setState];
};
export default useFormState;
