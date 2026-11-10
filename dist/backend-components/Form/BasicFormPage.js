import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, } from "react";
import { FORM_SUBMITTING_READ_ONLY_REASON, useFormContextLite, } from "../Form";
import { UnsafeToLeaveDispatch } from "../../framework/UnsafeToLeave";
import { FrameworkHistory } from "../../framework/History";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { captureError } from "../../framework/ErrorReporting";
import { showConfirmDialog, showConfirmDialogBool, showErrorDialog, } from "../../non-standalone/Dialog/Utils";
import { FormDialogDispatchContext } from "./FormDialog";
import FormPageLayout from "../../standalone/Form/FormPageLayout";
import FormLoaderOverlay from "../../standalone/Form/FormLoaderOverlay";
import useCCTranslations from "../../utils/useCCTranslations";
import { Action } from "history";
import { RouteContext } from "../../standalone/Routes/Route";
import matchPath from "../../standalone/Routes/matchPath";
import { useThemeProps } from "@mui/material";
export const BasicFormPageNestingContext = createContext(null);
/**
 * Does a navigation to pathname stay inside the form page (routed tab panels, a routed
 * stepper)? It does when the form's Route still renders at pathname with the same url: the
 * url itself or a path below it (/rec/1 → /rec/1/more), not one that only starts with the
 * same characters (/rec/10, /rec/1-archive).
 * At the root this follows the Route too: a Route "/" renders only at "/", so every other
 * path leaves the page; a Route "/*" renders at every path, so for it no path leaves the
 * page.
 * @param routePath The full path of the form's nearest Route (RouteContext path)
 * @param routeUrl The url the Route currently matches (RouteContext url)
 * @param pathname The navigation's target
 */
const isInsideFormPage = (routePath, routeUrl, pathname) => matchPath({ path: routePath }, pathname)?.url === routeUrl;
const BasicFormPage = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcBasicFormPage" });
    const { submit, 
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    safeSubmit: unusedSafeSubmit, // replaced by handleSafeSubmit below, must not reach the renderer
    dirty, disableRouting, postSubmitHandler, isSubmitting, children: FormButtons, form, childrenProps, customProps: originalCustomProps, formPageLayoutComponent, ...otherProps } = props;
    const { t } = useCCTranslations();
    const { readOnly, readOnlyReasons, addEventListener, removeEventListener } = useFormContextLite();
    // a save makes the form read-only too, but its changes are unsaved until it succeeds and
    // a failed save is shown in the form, so a form being saved keeps its guards. Only a form
    // which is read-only for another reason goes without them.
    const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some((reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON);
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
    const routePath = routeCtx ? routeCtx.path : "";
    useEffect(() => {
        // if the form is read-only, don't annoy the user
        if (readOnlyBesidesSaving)
            return;
        // set while the history block is lifted for a POP inside the form page, see passThrough
        let stopWaitingForPop = null;
        const releaseHistoryBlock = () => {
            if (unblock.current) {
                unblock.current();
                unblock.current = undefined;
            }
        };
        const blocker = (transition) => {
            const allowTransition = () => {
                // temp unblock to retry transaction
                releaseHistoryBlock();
                transition.retry();
            };
            // lets a navigation inside the form page through and keeps the page guarded
            const passThrough = () => {
                releaseHistoryBlock();
                if (transition.action === Action.Pop) {
                    // A browser history reverts every POP while a blocker is set and retries
                    // it asynchronously (history.go), so block again only once the retried POP
                    // has arrived: blocking at once would revert it again, and so on forever.
                    stopWaitingForPop = FrameworkHistory.listen(() => applyGuards(dirtyRef.current));
                    transition.retry();
                }
                else {
                    // PUSH and REPLACE are retried synchronously
                    transition.retry();
                    applyGuards(dirtyRef.current);
                }
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
                isInsideFormPage(routePath, routeUrl, transition.location.pathname)) {
                passThrough();
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
            if (stopWaitingForPop) {
                stopWaitingForPop();
                stopWaitingForPop = null;
            }
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
                releaseHistoryBlock();
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
        readOnlyBesidesSaving,
        t,
        formDialog,
        routePath,
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
                        if (dirtyRef.current &&
                            !readOnlyBesidesSaving &&
                            !forceNavigate) {
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
