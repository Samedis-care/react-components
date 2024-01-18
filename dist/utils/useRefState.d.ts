import React, { Dispatch } from "react";
interface UseRefStateResult<T> {
    /**
     * get ref value
     */
    get: () => T;
    /**
     * set ref/state value
     */
    set: Dispatch<React.SetStateAction<T>>;
    /**
     * state value
     */
    state: T;
}
/**
 * Combines and synchronizes useRef and useState
 * @param initialValue The initial value (like useState)
 */
declare const useRefState: <T>(initialValue: T | (() => T)) => UseRefStateResult<T>;
export default useRefState;
