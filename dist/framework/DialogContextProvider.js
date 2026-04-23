import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useRef, useState, } from "react";
import useCCTranslations from "../utils/useCCTranslations";
import { FrameworkHistory } from "./History";
/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext(undefined);
export const useDialogContext = () => {
    const ctx = useContext(DialogContext);
    if (!ctx)
        throw new Error("DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?");
    return ctx;
};
const navBlockFn = (t) => () => {
    alert(t("framework.dialogs.navblock"));
    return false;
};
/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props) => {
    const { t } = useCCTranslations();
    const navBlock = useRef(null);
    const dialogCount = useRef(0);
    const [dialogs, setDialogs] = useState([]);
    const parentContext = useContext(DialogContext);
    const pushDialog = useCallback((dialog) => {
        // if no dialogs were present, add callback
        if (dialogCount.current === 0) {
            navBlock.current = FrameworkHistory.block(navBlockFn(t));
        }
        dialogCount.current++;
        setDialogs((prevValue) => [...prevValue, dialog]);
    }, [t]);
    const popDialog = useCallback(() => {
        if (dialogCount.current === 0) {
            if (parentContext) {
                // call parent popDialog and return
                return parentContext[1]();
            }
            const err = new Error("[Components-Care] Trying to close non-existing dialog");
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
        setDialogs((prevValue) => {
            void prevValue.pop();
            return [...prevValue];
        });
    }, [parentContext]);
    const dialogActions = useMemo(() => [pushDialog, popDialog], [pushDialog, popDialog]);
    // update callback if locale changes
    useEffect(() => {
        if (!navBlock.current)
            return;
        navBlock.current(); // unblock
        navBlock.current = FrameworkHistory.block(navBlockFn(t)); // reblock
    }, [t]);
    // remove callback on unmount
    useEffect(() => {
        return () => {
            if (navBlock.current) {
                navBlock.current();
                navBlock.current = null;
                // eslint-disable-next-line no-console
                console.warn(
                // eslint-disable-next-line react-hooks/exhaustive-deps
                `[Components-Care] [DialogContextProvder] Unmounting with ${dialogCount.current} dialogs open`);
            }
        };
    }, []);
    return (_jsx(_Fragment, { children: _jsxs(DialogContext.Provider, { value: dialogActions, children: [_jsx(_Fragment, { children: props.children }), _jsx(_Fragment, { children: dialogs.map((dialog, index) => (_jsx(Suspense, { children: dialog }, index.toString()))) })] }) }));
};
export default React.memo(DialogContextProvider);
