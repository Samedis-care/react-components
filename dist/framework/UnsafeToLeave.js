import React, { useContext, useEffect, useRef, useState } from "react";
const noopLock = () => () => {
    return;
};
export const UnsafeToLeaveDispatch = {
    lock: noopLock,
};
const UnsafeToLeaveContext = React.createContext(false);
export const useIsUnsafeToLeave = () => {
    return useContext(UnsafeToLeaveContext);
};
const UnsafeToLeave = (props) => {
    const { disable } = props;
    const [reasons, setReasons] = useState([]);
    const reasonsRef = useRef([]);
    useEffect(() => {
        if (disable)
            return;
        const unloadListener = (evt) => {
            // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload#example
            // message customization not possible
            if (reasonsRef.current.length > 0) {
                evt.preventDefault();
                evt.returnValue = "";
            }
            else {
                delete evt.returnValue;
            }
        };
        window.addEventListener("beforeunload", unloadListener);
        if (UnsafeToLeaveDispatch.lock !== noopLock) {
            throw new Error("More than one instance of UnsafeToLeave loaded");
        }
        UnsafeToLeaveDispatch.lock = (reason) => {
            const uuid = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map((e) => e.toString(16))
                .join("");
            const ident = reason ? uuid + "_" + reason : uuid;
            reasonsRef.current = [...reasonsRef.current, ident];
            setReasons(reasonsRef.current);
            return () => {
                reasonsRef.current = reasonsRef.current.filter((entry) => entry !== ident);
                setReasons(reasonsRef.current);
            };
        };
        return () => {
            UnsafeToLeaveDispatch.lock = noopLock;
            window.removeEventListener("beforeunload", unloadListener);
        };
    }, [disable]);
    return (React.createElement(UnsafeToLeaveContext.Provider, { value: reasons.length > 0 }, props.children));
};
export default React.memo(UnsafeToLeave);
