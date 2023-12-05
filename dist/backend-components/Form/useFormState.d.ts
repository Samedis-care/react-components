import { Dispatch, SetStateAction } from "react";
/**
 * useState, but persisted in the form state so it survives remounts
 * @param name A unique name
 * @param initialState Initial state
 * @see setState, useFormContext => getCustomState, setCustomState
 * @remarks This is only to be used to survive remounts, this does not work to sync the state of two components!
 */
declare const useFormState: <S>(name: string, initialState: S | (() => S)) => [S, Dispatch<SetStateAction<S>>];
export default useFormState;
