import React, { useCallback, useContext, useMemo, useRef, useState, } from "react";
import useCCTranslations from "../utils/useCCTranslations";
import { useBlocker } from "react-router-dom";
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
    const dialogCount = useRef(0);
    const [dialogs, setDialogs] = useState([]);
    const parentContext = useContext(DialogContext);
    const blocker = useBlocker(dialogs.length > 0 && dialogCount.current > 0 && navBlockFn(t));
    const pushDialog = useCallback((dialog) => {
        dialogCount.current++;
        setDialogs((prevValue) => [...prevValue, dialog]);
    }, []);
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
        if (dialogCount.current === 0 && blocker.reset) {
            blocker.reset();
        }
        setDialogs((prevValue) => {
            prevValue.pop();
            return [...prevValue];
        });
    }, [blocker, parentContext]);
    const dialogActions = useMemo(() => [pushDialog, popDialog], [pushDialog, popDialog]);
    return (React.createElement(React.Fragment, null,
        React.createElement(DialogContext.Provider, { value: dialogActions },
            React.createElement(React.Fragment, null, props.children),
            React.createElement(React.Fragment, null, dialogs.map((dialog, index) => (React.createElement(React.Fragment, { key: index.toString() }, dialog)))))));
};
export default React.memo(DialogContextProvider);
