import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, } from "react";
import { useFormContextLite } from "../Form";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { FrameworkHistory } from "../../framework/History";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { captureError } from "../../framework/ErrorReporting";
import { showConfirmDialog, showConfirmDialogBool, showErrorDialog, } from "../../non-standalone/Dialog/Utils";
import { FormDialogDispatchContext } from "./FormDialog";
import FormPageLayout from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { RouteContext } from "../../standalone/Routes/Route";
import { useThemeProps } from "@mui/material";
export const BasicFormPageNestingContext = createContext(null);
const BasicFormPage = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcBasicFormPage" });
    const { submit, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    safeSubmit: unusedSafeSubmit, // replaced by handleSafeSubmit below, must not reach the renderer
    dirty, disableRouting, postSubmitHandler, isSubmitting, children: FormButtons, form, childrenProps, customProps: originalCustomProps, formPageLayoutComponent, ...otherProps } = props;
    const { t } = useCCTranslations();
    const { readOnly, readOnlyReasons, addEventListener, removeEventListener } = useFormContextLite();
    // the dirty prop is one render behind the form engine, which breaks "submit, then
    // navigate away": the record is saved, but the guards below still see a dirty form.
    // The dirty event fires as soon as the form engine sees the change, so this ref is
    // current even while a re-render is still pending.
    const dirtyRef = useRef(dirty);
    useEffect(() => {
        const handleDirtyChange = (event) => {
            dirtyRef.current = event.dirty;
        };
        addEventListener("dirty", handleDirtyChange);
        return () => removeEventListener("dirty", handleDirtyChange);
    }, [addEventListener, removeEventListener]);
    const [childActiveCount, setChildActiveCount] = useState(0);
    const childActive = childActiveCount > 0;
    const setChildActive = useCallback((active) => {
        setChildActiveCount((c) => c + (active ? 1 : -1));
    }, []);
    const hideParent = useContext(BasicFormPageNestingContext);
    useEffect(() => {
        if (!hideParent)
            return;
        hideParent(true);
        return () => hideParent(false);
    }, [hideParent]);
    const [pushDialog] = useDialogContext();
    const formDialog = useContext(FormDialogDispatchContext);
    const unblock = useRef(undefined);
    const routeCtx = useContext(RouteContext);
    if (!disableRouting && !routeCtx)
        throw new Error("no route match");
    const routeUrl = routeCtx ? routeCtx.url : "";
    useEffect(() => {
        // if the form is read-only, don't annoy the user
        if (readOnly)
            return;
        const blocker = (transition) => {
            const allowTransition = () => {
                // temp unblock to retry transaction
                if (unblock.current) {
                    unblock.current();
                    unblock.current = undefined;
                }
                transition.retry();
            };
            //console.log("History.block(", location, ",", action, ")", match);
            // the form may have gone clean since the guards were applied (a submit resolves
            // before React re-renders), so never ask about changes which no longer exist
            if (!dirtyRef.current) {
                applyGuards(false);
                transition.retry();
                return;
            }
            // special handling: routing inside form page (e.g. routed tab panels, routed stepper)
            if (!disableRouting &&
                transition.location.pathname.startsWith(routeUrl)) {
                allowTransition();
                unblock.current = FrameworkHistory.block(blocker);
                return;
            }
            // otherwise: ask user for confirmation
            void (async () => {
                const leave = await showConfirmDialogBool(pushDialog, {
                    title: t("backend-components.form.back-on-dirty.title"),
                    message: t("backend-components.form.back-on-dirty.message"),
                    textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                    textButtonNo: t("backend-components.form.back-on-dirty.no"),
                });
                if (leave) {
                    allowTransition();
                }
            })();
        };
        // the guards are driven by the form engine's dirty event rather than by rendered
        // state, so that submitting and then leaving in one go isn't stopped by a dirty
        // flag which a pending re-render would have cleared. Idempotent in both directions.
        let releaseLocks = null;
        const applyGuards = (isDirty) => {
            if (isDirty) {
                if (!unblock.current)
                    unblock.current = FrameworkHistory.block(blocker);
                if (releaseLocks)
                    return;
                const safeToLeave = UnsafeToLeaveDispatch.lock("form-dirty");
                if (formDialog)
                    formDialog.blockClosing();
                releaseLocks = () => {
                    safeToLeave();
                    if (formDialog)
                        formDialog.unblockClosing();
                };
            }
            else {
                if (unblock.current) {
                    unblock.current();
                    unblock.current = undefined;
                }
                if (releaseLocks) {
                    releaseLocks();
                    releaseLocks = null;
                }
            }
        };
        const handleDirtyChange = (event) => applyGuards(event.dirty);
        applyGuards(dirtyRef.current);
        addEventListener("dirty", handleDirtyChange);
        return () => {
            removeEventListener("dirty", handleDirtyChange);
            applyGuards(false);
        };
    }, [
        readOnly,
        t,
        formDialog,
        routeUrl,
        pushDialog,
        disableRouting,
        addEventListener,
        removeEventListener,
    ]);
    // go back confirm dialog if form is dirty
    const customPropsWithGoBack = typeof originalCustomProps === "object"
        ? {
            ...(typeof originalCustomProps === "object"
                ? originalCustomProps
                : null),
        }
        : originalCustomProps;
    if (typeof originalCustomProps === "object" &&
        originalCustomProps &&
        "goBack" in originalCustomProps) {
        const orgGoBack = originalCustomProps.goBack;
        customPropsWithGoBack.goBack =
            typeof orgGoBack === "function"
                ? async (forceRefresh, forceNavigate) => {
                    try {
                        if (dirtyRef.current && !readOnly && !forceNavigate) {
                            await showConfirmDialog(pushDialog, {
                                title: t("backend-components.form.back-on-dirty.title"),
                                message: t("backend-components.form.back-on-dirty.message"),
                                textButtonYes: t("backend-components.form.back-on-dirty.yes"),
                                textButtonNo: t("backend-components.form.back-on-dirty.no"),
                            });
                        }
                        if (unblock.current) {
                            unblock.current();
                            unblock.current = undefined;
                        }
                        orgGoBack(forceRefresh);
                    }
                    catch {
                        // user cancelled
                    }
                }
                : orgGoBack;
    }
    const handleSubmit = useCallback(async () => {
        await submit();
        if (postSubmitHandler) {
            try {
                await postSubmitHandler();
            }
            catch (e) {
                captureError(e, { source: "BasicFormPage.postSubmitHandler" });
                await showErrorDialog(pushDialog, e);
            }
        }
    }, [submit, postSubmitHandler, pushDialog]);
    // note: a postSubmitHandler which throws doesn't make this return false, the record was saved
    // either way and the failure is shown to the user by handleSubmit itself
    const handleSafeSubmit = useCallback(async () => {
        try {
            await handleSubmit();
            return true;
        }
        catch {
            // ignore, shown to user via ErrorComponent and reported via captureError in submitForm
            return false;
        }
    }, [handleSubmit]);
    const UsedFormPageLayout = formPageLayoutComponent ?? FormPageLayout;
    return (_jsx(BasicFormPageNestingContext.Provider, { value: setChildActive, children: _jsx(UsedFormPageLayout, { body: form, footer: childActive ? null : (_jsx(FormButtons, { ...childrenProps, ...otherProps, showBackButtonOnly: otherProps.showBackButtonOnly ||
                    (readOnly && !Object.values(readOnlyReasons).find((e) => !!e)), readOnly: readOnly, readOnlyReasons: readOnlyReasons, isSubmitting: isSubmitting, dirty: dirty, disableRouting: disableRouting, submit: handleSubmit, safeSubmit: handleSafeSubmit, customProps: (typeof originalCustomProps === "object" &&
                    originalCustomProps != null
                    ? customPropsWithGoBack
                    : originalCustomProps) })), other: childActive ? undefined : _jsx(FormLoaderOverlay, { visible: isSubmitting }) }) }));
};
export default React.memo(BasicFormPage);
