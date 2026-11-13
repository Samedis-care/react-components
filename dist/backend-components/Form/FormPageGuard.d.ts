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
     * Lifts the history block, for a navigation the user has already confirmed (the form
     * page's goBack). The block is set again by the form's next change of dirty state.
     */
    releaseHistoryBlock: () => void;
}
/**
 * The leave guard of the Form a form page is rendered in; null outside of a Form's page
 */
export declare const FormPageGuardContext: React.Context<FormPageGuard | null>;
export interface UseFormPageGuardParams {
    /**
     * The Form's disableRouting: every navigation leaves the form
     */
    disableRouting: boolean;
    /**
     * Is the form read-only for a reason other than a save? Then it takes no guard.
     */
    readOnlyBesidesSaving: boolean;
    /**
     * The Form's rendered dirty state, read once as the start value; the "dirty" event
     * keeps the guard current from then on
     */
    dirty: boolean;
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
 * The leave guard of a Form's unsaved changes: while the form is dirty, a navigation asks
 * "Leave form page?" (a navigation inside the form's Route passes, unless disableRouting),
 * closing the browser tab asks (UnsafeToLeave), and so does closing the FullFormDialog the
 * Form is in. A form that is read-only for a reason other than a save takes no guard.
 *
 * The Form holds it, because the changes are the Form's: once a form page has switched it on
 * (FormPageGuard.enable), it lasts until the Form unmounts, also while no form page is
 * mounted (a form page in a routed tab panel when another tab is open).
 * @param params The Form's state
 * @returns The guard, which the Form provides to its pages through FormPageGuardContext
 */
declare const useFormPageGuard: (params: UseFormPageGuardParams) => FormPageGuard;
export default useFormPageGuard;
