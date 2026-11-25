import React from "react";
import { FormEventTarget } from "./FormEvents";
/**
 * The leave guard of a Form, which its form pages switch on
 * @see useFormPageGuard
 */
export interface FormPageGuard {
    /**
     * Guards the form's unsaved changes from now on, until the Form unmounts. A form page
     * calls it when it mounts; calling it again does nothing.
     */
    enable: () => void;
    /**
     * Runs go, which leaves the form after the user has confirmed it (the form page's
     * goBack): a navigation go starts while it runs passes without asking about this form's
     * changes again. It still asks about the changes of other dirty forms it leaves. When go
     * does not leave the form, the form stays guarded.
     * @param go Starts the navigation, synchronously
     */
    leave: (go: () => void) => void;
}
/**
 * The leave guard of the Form a form page is rendered in; null outside of a Form's page
 */
export declare const FormPageGuardContext: React.Context<FormPageGuard | null>;
export interface UseFormPageGuardParams {
    /**
     * Is the form read-only for a reason other than a save? Then it takes no guard.
     */
    readOnlyBesidesSaving: boolean;
    /**
     * Does the Form hold unsaved changes (its rendered dirty || stagedDirty)? Read once as
     * the start value; the "dirty" event keeps the guard current from then on
     */
    unsaved: boolean;
    /**
     * The Form's addEventListener
     */
    addEventListener: FormEventTarget["addEventListener"];
    /**
     * The Form's removeEventListener
     */
    removeEventListener: FormEventTarget["removeEventListener"];
}
/**
 * The history state of a navigation that moves a form page to another url rather than
 * leaving it: CRUD's REPLACE from the create form to the record it has just saved
 * (<url>/new → <url>/<id>), which keeps the Form and everything on it. The leave guard lets
 * it pass, whatever the form's dirty state, and keeps guarding the page at its new url.
 */
export declare const FORM_PAGE_MOVE_STATE: Readonly<{
    formPageMove: true;
}>;
/**
 * The leave guard of a Form's unsaved changes: while the form is dirty or, in flow mode,
 * holds staged changes (FormContextData.stagedDirty), a navigation asks
 * "Leave form page?" (a navigation that keeps the form's Route rendered at the same url
 * passes, also for a disableRouting Form, and so does a move of the page marked with
 * FORM_PAGE_MOVE_STATE),
 * closing the browser tab asks (UnsafeToLeave), and so does closing the FullFormDialog the
 * Form is in. A form that is read-only for a reason other than a save takes no guard.
 *
 * The Form holds it, because the changes are the Form's: once a form page has switched it on
 * (FormPageGuard.enable), it lasts until the Form unmounts, also while no form page is
 * mounted (a form page in a routed tab panel when another tab is open).
 *
 * The guards of all Forms in a Framework, those in pushed dialogs included, block the history
 * together (the Framework's NavigationGuard): a navigation that leaves several dirty forms asks
 * once, and after "Yes" the forms it did not leave stay guarded. A Form outside of a Framework
 * blocks the history on its own.
 * @param params The Form's state
 * @returns The guard, which the Form provides to its pages through FormPageGuardContext
 */
declare const useFormPageGuard: (params: UseFormPageGuardParams) => FormPageGuard;
export default useFormPageGuard;
