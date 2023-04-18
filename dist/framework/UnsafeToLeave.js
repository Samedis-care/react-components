var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useContext, useEffect, useRef, useState } from "react";
var noopLock = function () { return function () {
    return;
}; };
export var UnsafeToLeaveDispatch = {
    lock: noopLock,
};
var UnsafeToLeaveContext = React.createContext(false);
export var useIsUnsafeToLeave = function () {
    return useContext(UnsafeToLeaveContext);
};
var UnsafeToLeave = function (props) {
    var disable = props.disable;
    var _a = useState([]), reasons = _a[0], setReasons = _a[1];
    var reasonsRef = useRef([]);
    useEffect(function () {
        if (disable)
            return;
        var unloadListener = function (evt) {
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
        UnsafeToLeaveDispatch.lock = function (reason) {
            var uuid = Array.from(crypto.getRandomValues(new Uint8Array(16)))
                .map(function (e) { return e.toString(16); })
                .join("");
            var ident = reason ? uuid + "_" + reason : uuid;
            reasonsRef.current = __spreadArray(__spreadArray([], reasonsRef.current, true), [ident], false);
            setReasons(reasonsRef.current);
            return function () {
                reasonsRef.current = reasonsRef.current.filter(function (entry) { return entry !== ident; });
                setReasons(reasonsRef.current);
            };
        };
        return function () {
            UnsafeToLeaveDispatch.lock = noopLock;
            window.removeEventListener("beforeunload", unloadListener);
        };
    }, [disable]);
    return (React.createElement(UnsafeToLeaveContext.Provider, { value: reasons.length > 0 }, props.children));
};
export default React.memo(UnsafeToLeave);
