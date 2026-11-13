import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { Suspense, useCallback, useContext, useMemo, useRef, useState, } from "react";
import { PushedDialogCloseContext, } from "./PushedDialogCloseContext";
/**
 * Context for the dialog state
 */
export const DialogContext = React.createContext(undefined);
/**
 * Returns the dialog functions `[pushDialog, popDialog]` of the nearest
 * DialogContextProvider (part of Framework). pushDialog returns a function that closes the
 * dialog it pushed; see DialogContextType.
 * @throws Error when there is no DialogContextProvider around the calling component
 */
export const useDialogContext = () => {
    const ctx = useContext(DialogContext);
    if (!ctx)
        throw new Error("DialogContext is missing, did you forget to add Components-Care Framework or DialogContextProvider?");
    return ctx;
};
/**
 * Provides the application with an state to display an dialog
 */
const DialogContextProvider = (props) => {
    // the ids of the open dialogs in push order, current before the dialogs state renders
    const openIds = useRef([]);
    const nextId = useRef(0);
    const [dialogs, setDialogs] = useState([]);
    const parentContext = useContext(DialogContext);
    // removes a dialog whose id was taken out of openIds
    const removeDialog = useCallback((id) => {
        setDialogs((prevValue) => prevValue.filter((entry) => entry.id !== id));
    }, []);
    const closeDialog = useCallback((id) => {
        const index = openIds.current.indexOf(id);
        if (index === -1)
            return; // closed already
        openIds.current.splice(index, 1);
        removeDialog(id);
    }, [removeDialog]);
    const pushDialog = useCallback((dialog) => {
        const id = nextId.current++;
        openIds.current.push(id);
        // one function for the dialog's life: returned here, and the dialog's
        // PushedDialogCloseContext (useCloseThisDialog)
        const close = () => closeDialog(id);
        const entry = {
            id,
            dialog,
            close: { close, pushed: true },
        };
        setDialogs((prevValue) => [...prevValue, entry]);
        return close;
    }, [closeDialog]);
    const popDialog = useCallback(() => {
        const id = openIds.current.pop();
        if (id === undefined) {
            if (parentContext) {
                // call parent popDialog and return
                return parentContext[1]();
            }
            const err = new Error("[Components-Care] Trying to close non-existing dialog");
            // eslint-disable-next-line no-console
            console.error(err);
            throw err;
        }
        removeDialog(id);
    }, [parentContext, removeDialog]);
    const dialogActions = useMemo(() => [pushDialog, popDialog], [pushDialog, popDialog]);
    return (_jsx(_Fragment, { children: _jsxs(DialogContext.Provider, { value: dialogActions, children: [_jsx(_Fragment, { children: props.children }), _jsx(_Fragment, { children: dialogs.map((entry) => (_jsx(PushedDialogCloseContext.Provider, { value: entry.close, children: _jsx(Suspense, { children: entry.dialog }) }, entry.id))) })] }) }));
};
export default React.memo(DialogContextProvider);
