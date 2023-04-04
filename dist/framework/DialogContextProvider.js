var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import { FrameworkHistory } from "./History";
import useCCTranslations from "../utils/useCCTranslations";
/**
 * Context for the dialog state
 */
export var DialogContext = React.createContext(undefined);
export var useDialogContext = function () {
    var ctx = useContext(DialogContext);
    if (!ctx)
        throw new Error("DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?");
    return ctx;
};
var navBlockFn = function (t) { return function () {
    alert(t("framework.dialogs.navblock"));
    return false;
}; };
/**
 * Provides the application with an state to display an dialog
 */
var DialogContextProvider = function (props) {
    var t = useCCTranslations().t;
    var navBlock = useRef(null);
    var dialogCount = useRef(0);
    var _a = useState([]), dialogs = _a[0], setDialogs = _a[1];
    var parentContext = useContext(DialogContext);
    var pushDialog = useCallback(function (dialog) {
        // if no dialogs were present, add callback
        if (dialogCount.current === 0) {
            navBlock.current = FrameworkHistory.block(navBlockFn(t));
        }
        dialogCount.current++;
        setDialogs(function (prevValue) { return __spreadArray(__spreadArray([], prevValue, true), [dialog], false); });
    }, [t]);
    var popDialog = useCallback(function () {
        if (dialogCount.current === 0) {
            if (parentContext) {
                // call parent popDialog and return
                return parentContext[1]();
            }
            var err = new Error("[Components-Care] Trying to close non-existing dialog");
            // eslint-disable-next-line no-console
            console.error(err);
            throw err;
        }
        // if all dialogs closed, remove callback
        dialogCount.current--;
        if (dialogCount.current === 0 && navBlock.current) {
            navBlock.current();
            navBlock.current = null;
        }
        setDialogs(function (prevValue) {
            prevValue.pop();
            return __spreadArray([], prevValue, true);
        });
    }, [parentContext]);
    var dialogActions = useMemo(function () { return [pushDialog, popDialog]; }, [pushDialog, popDialog]);
    // update callback if locale changes
    useEffect(function () {
        if (!navBlock.current)
            return;
        navBlock.current(); // unblock
        navBlock.current = FrameworkHistory.block(navBlockFn(t)); // reblock
    }, [t]);
    // remove callback on unmount
    useEffect(function () {
        return function () {
            if (navBlock.current) {
                navBlock.current();
                navBlock.current = null;
            }
        };
    }, []);
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContext.Provider, { value: dialogActions },
            React.createElement(React.Fragment, null, props.children),
            React.createElement(React.Fragment, null, dialogs.map(function (dialog, index) { return (React.createElement(React.Fragment, { key: index.toString() }, dialog)); })))));
};
export default React.memo(DialogContextProvider);
