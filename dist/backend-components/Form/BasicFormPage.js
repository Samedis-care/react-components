import { jsx as _jsx } from "react/jsx-runtime";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState, } from "react";
import { FORM_SUBMITTING_READ_ONLY_REASON, useFormContextLite, } from "../Form";
import { FormPageGuardContext } from "./FormPageGuard";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { captureError } from "../../framework/ErrorReporting";
import { showConfirmDialog, showErrorDialog, } from "../../non-standalone/Dialog/Utils";
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
    // a save makes the form read-only too, but its changes are unsaved until it succeeds and
    // a failed save is shown in the form, so goBack asks while the form saves, like the
    // Form's leave guard. A form which is read-only for another reason is left without asking.
    const readOnlyBesidesSaving = Object.keys(readOnlyReasons).some((reason) => reason !== FORM_SUBMITTING_READ_ONLY_REASON);
    // the dirty prop is one render behind the form engine, which breaks "submit, then
    // go back": the record is saved, but goBack below would still see a dirty form.
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
    const routeCtx = useContext(RouteContext);
    if (!disableRouting && !routeCtx)
        throw new Error("no route match");
    // the leave guard belongs to the Form, which keeps the changes also while this page is
    // not mounted (a page in a routed tab panel when another tab is open): this page only
    // switches it on, for the rest of the Form's life
    const pageGuard = useContext(FormPageGuardContext);
    useEffect(() => {
        pageGuard?.enable();
    }, [pageGuard]);
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
                        pageGuard?.releaseHistoryBlock();
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
