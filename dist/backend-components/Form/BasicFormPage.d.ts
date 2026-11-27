import React from "react";
import { FormContextData, PageProps } from "../Form";
import { ModelUnknown } from "../../backend-integration/Model/Model";
import { FormPageLayoutProps } from "../../standalone/Form/FormPageLayout";
import { CrudFormProps } from "../CRUD";
export interface BasicFormPageRendererProps<CustomPropsT> extends Omit<PageProps<ModelUnknown, CustomPropsT>, "submit" | "safeSubmit" | "dirty"> {
    /**
     * Function to submit everything
     * @remarks throws if submitting fails
     */
    submit: () => Promise<void>;
    /**
     * Function to submit everything, swallowing any error
     * @returns false if submitting failed, true otherwise
     * @see FormContextData.safeSubmit
     */
    safeSubmit: () => Promise<boolean>;
    /**
     * Is the form dirty?
     * @see FormContextData.dirty
     */
    dirty: boolean;
    /**
     * Is the form read-only
     */
    readOnly: boolean;
    /**
     * Optional read-only reasons
     */
    readOnlyReasons: FormContextData<ModelUnknown>["readOnlyReasons"];
    /**
     * Show back button only when not enough permission
     */
    showBackButtonOnly?: boolean;
    /**
     * Automatically go back after submit
     */
    autoBack?: boolean;
    /**
     * Confirm dialog message
     */
    confirmDialogMessage?: string;
}
export type EnhancedGoBackType = {
    /**
     * Closes the form page, asking the user for confirmation if the form holds unsaved changes
     * (dirty or, in flow mode, stagedDirty) at the call, as the form engine sees them: also
     * right after a save resolved, before React re-rendered, and for a change a control made in
     * its mount effect
     * @param forceRefresh Force a refresh of the CRUD data grid after navigating back? (default false)
     * @param forceNavigate Skip the unsaved changes confirmation dialog and navigate back immediately? (default false).
     *                      Has no effect if the form isn't dirty or is read-only for a reason other than a
     *                      pending save, as no dialog is shown then.
     * @returns A promise which resolves once the user confirmed (or the dialog was skipped) and navigation happened.
     *          Resolves without navigating if the user cancelled the confirmation dialog (No, Escape, a
     *          backdrop click). An error thrown by the Form's goBack does not reject it: the error is
     *          reported (captureError, source "BasicFormPage.goBack") and shown in an error dialog,
     *          and the promise resolves once that dialog is closed.
     * @remarks Enhances CrudFormProps.goBack, which only takes forceRefresh and shows no confirmation dialog.
     *          A navigation the Form's goBack starts synchronously (CRUD's goBack does) passes without
     *          asking about this form again; it asks once about other dirty forms it leaves. A
     *          navigation it starts later asks again. When goBack does not leave the form, the form
     *          stays guarded.
     * @see CrudFormProps.goBack
     */
    goBack: (forceRefresh?: boolean, forceNavigate?: boolean) => Promise<void> | void;
};
/**
 * The Form's customProps as BasicFormPage's footer gets them. Without a goBack function they
 * are the Form's customProps object itself. With one, they are a copy whose goBack is the
 * confirming one (EnhancedGoBackType): the copy has the prototype of the Form's customProps
 * (a class instance's methods stay), and their own properties, getters as getters. The copy is
 * made again when the Form's customProps change, and its goBack stays the same function for
 * the life of the page: when called, it calls the goBack of the Form's latest customProps, as
 * their method (a goBack method keeps its this).
 */
export type EnhancedCustomProps<T> = T extends Pick<CrudFormProps, "goBack"> ? Omit<T, "goBack"> & EnhancedGoBackType : T;
export interface BasicFormPageProps<RendererPropsT, CustomPropsT> extends PageProps<ModelUnknown, CustomPropsT> {
    /**
     * Called after submit successfully completed
     */
    postSubmitHandler?: () => Promise<void> | void;
    /**
     * The form page contents renderer
     */
    children: React.ComponentType<BasicFormPageRendererProps<EnhancedCustomProps<CustomPropsT>> & RendererPropsT>;
    /**
     * Additional props passed to children
     */
    childrenProps: RendererPropsT;
    /**
     * Actual form
     */
    form: React.ReactNode;
    /**
     * read only mode?
     */
    showBackButtonOnly?: boolean;
    /**
     * custom form page layout component
     */
    formPageLayoutComponent?: React.ComponentType<FormPageLayoutProps>;
}
export declare const BasicFormPageNestingContext: React.Context<((active: boolean) => void) | null>;
declare const BasicFormPage: <RendererPropsT, CustomPropsT>(inProps: BasicFormPageProps<RendererPropsT, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof BasicFormPage;
export default _default;
