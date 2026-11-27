import React, { Dispatch, SetStateAction } from "react";
import { ModelFieldNames, ModelFieldValues, ModelGetResponseRelations, ModelRecord, ModelRecordPartial, ModelUnknown } from "../../backend-integration/Model/Model";
import { QueryObserverBaseResult } from "@tanstack/react-query";
import ValidationError from "./ValidationError";
import { FormEventTarget } from "./FormEvents";
/**
 * The messages of a validation by field name, `{ [field]: message }`, as every validate
 * function returns them: validateForm, a custom validation or warning handler, the model's
 * validate, the validate of CrudImport and useCrudSelect. Empty when nothing failed.
 * @remarks It is not an error. To throw it, or to show it with showErrorDialog, wrap it in a
 *          ValidationError: `throw new ValidationError("error", result)`. showErrorDialog
 *          lists the messages of a ValidationError only; a plain object gets the generic
 *          error dialog without details.
 */
export type ValidationResult = Record<string, string>;
/**
 * Pre submit handler for additional validations
 * Throw to cancel submit and display error.
 * Thrown error may be a ValidationError or a normal Error (other error)
 */
export type CustomValidationHandler = () => Promise<ValidationResult> | ValidationResult;
/**
 * Pre submit handler to perform final changes (bypassing validation)
 */
export type PreSubmitHandler = (id: string | null, submitOptions: FormSubmitOptions) => Promise<void> | void;
/**
 * Post submit handler to submit additional data for the submitted record
 */
export type PostSubmitHandler = (id: string, submitOptions: FormSubmitOptions) => Promise<void> | void;
export declare enum OnlySubmitMountedBehaviour {
    /**
     * Omit the unmounted values from backend POST/PUT requests entirely
     */
    OMIT = "omit",
    /**
     * Replace the unmounted values with their default values on POST/PUT requests
     */
    DEFAULT = "default",
    /**
     * Replace the unmounted values with null on POST/PUT requests
     */
    NULL = "null"
}
export interface PreSubmitParams<M extends ModelUnknown> {
    /**
     * The remote data
     */
    readonly serverData: ModelRecord<M>;
    /**
     * The local data
     */
    readonly formData: ModelRecord<M>;
    /**
     * submit options
     */
    readonly submitOptions: FormSubmitOptions;
    readonly deleteOnSubmit: boolean;
    readonly setFieldValue: FormContextData<M>["setFieldValue"];
}
export interface ErrorComponentProps {
    /**
     * The last error that happened
     */
    error: Error | ValidationError;
    /**
     * The id for the element that shows the error
     * @remarks Set by a control whose field references the error (`aria-describedby`)
     *          while it is shown. A component that shows the error elsewhere, like
     *          DefaultErrorComponent in a dialog, has no such element and ignores it.
     */
    id?: string;
}
export type FormSubmitOptions = Partial<{
    ignoreWarnings: boolean;
    /**
     * submit to server instead of staged values (only when using flowEngine mode)
     */
    submitToServer: boolean;
    /**
     * submits form to server even if not dirty
     */
    ignoreDirtyCheck: boolean;
}>;
export interface PageProps<M extends ModelUnknown, CustomPropsT> {
    /**
     * Indicates if the form is currently being submitted.
     * All submit buttons should be disabled if "isSubmitting" is true.
     */
    isSubmitting: boolean;
    /**
     * Is the form dirty?
     * @see FormContextData.dirty
     */
    dirty: boolean;
    /**
     * Flow mode: do values that stages staged and the flow has not saved yet differ from the
     * server record?
     * @see FormContextData.stagedDirty
     */
    stagedDirty: boolean;
    /**
     * Has the form disableRouting flag?
     * @see FormProps disableRouting
     */
    disableRouting: boolean;
    /**
     * The values of the form, can be used for conditional rendering.
     * Only present if renderConditionally is set to true in FormProps
     */
    values?: ModelRecord<M>;
    /**
     * Function to trigger form submit
     */
    submit: (params?: FormSubmitOptions | React.SyntheticEvent) => Promise<void>;
    /**
     * Function to trigger form submit, swallowing any error
     * @returns false if submitting failed, true otherwise
     * @see FormContextData.safeSubmit
     */
    safeSubmit: (params?: FormSubmitOptions | React.SyntheticEvent) => Promise<boolean>;
    /**
     * Function to trigger form reset
     */
    reset: () => void;
    /**
     * The current record id OR null if create new
     */
    id: string | null;
    /**
     * Custom props supplied by the parent for the children
     */
    customProps: CustomPropsT;
}
export interface FormProps<M extends ModelUnknown, CustomPropsT> {
    /**
     * The data model this form follows
     * @remarks Another model (another model id or other cache keys) starts the form over, like
     *          another id. A model object created again for the same model id and cache keys
     *          does not.
     */
    model: M;
    /**
     * The current data entry id
     * @remarks null for a new record. Another id starts the form over, as when it mounts: the
     *          page is mounted again, and the values, touched state, errors, warnings and custom
     *          state come from the new record. The validation and submit handlers the previous
     *          page registered are dropped, also those of a control it no longer showed, so
     *          nothing queued for the previous record is saved with the new one. A change from
     *          null to the id of the record the form has just created keeps the form as it is.
     */
    id: string | null;
    /**
     * Values a new record starts with, over the model's defaults (e.g. a record created from a
     * template or a copy, or a link to the record it is created for)
     * @remarks Only applied if ID is null
     * @remarks Read when the record loads, later changes are ignored
     * @remarks The fields it sets are changes to the new record: the form's dirty baseline
     *          (initialValues) is the model's default record, so a field set to another value
     *          than its default makes the form dirty from the start. Its Save is enabled, the
     *          leave guard asks, FormAutoSave saves it, the fields are marked with
     *          showDirtyState, and a nested form makes its parent dirty. A field set to its
     *          default, or changed back to it, is not a change. Values that should not count
     *          as a change belong in the model's defaults (a field's getDefaultValue).
     */
    initialRecord?: ModelRecordPartial<M>;
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * The form contents
     */
    children: React.ComponentType<PageProps<M, CustomPropsT>>;
    /**
     * Rerender page props if values changes
     */
    renderConditionally?: boolean;
    /**
     * Pre-submit callback to cancel submission
     * @param params The params provided
     * @return should cancel? false for continue, true for cancel
     */
    preSubmit?: (params: PreSubmitParams<M>) => Promise<boolean> | boolean;
    /**
     * Called upon successful submit
     * Contains data from server response
     * @param dataFromServer The data from the server response (model data)
     * @param submittedData The data submitted by the form
     * @param previousData The data previously provided by the server
     */
    onSubmit?: (dataFromServer: ModelRecord<M>, submittedData: ModelRecord<M>, previousData: ModelRecord<M>) => Promise<void> | void;
    /**
     * The submit stops keeping the form busy when `onSubmit` is called: unless
     * something else keeps it busy (`addBusyReason`), the fields and buttons are no
     * longer read-only and the busy overlay is hidden while `onSubmit` runs. A dialog
     * opened from `onSubmit` can be used without it, as the busy overlay stays below
     * dialogs. A boolean, or a function that decides per submit and gets the same
     * arguments as `onSubmit`.
     * @default false (the form stays busy until `onSubmit` has finished)
     */
    onSubmitUserInteractive?: boolean | ((dataFromServer: ModelRecord<M>, submittedData: ModelRecord<M>, previousData: ModelRecord<M>) => boolean);
    /**
     * Delete the record on submit rather than save it?
     */
    deleteOnSubmit?: boolean;
    /**
     * Delete on submit finish callback
     * @param id The ID of the record which deleteOnSubmit was performed for.
     *           May be null or empty string, in which case no delete was performed as the record does not even exist
     */
    onDeleted?: (id: string | null) => void;
    /**
     * Custom props supplied by the parent for the children
     */
    customProps: CustomPropsT;
    /**
     * Only submit mounted fields
     * @remarks Exempt fields using alwaysSubmitFields
     * @remarks The controls built on useLazyCrudConnector follow it too: the queued writes of
     *          one that is not mounted are neither saved nor counted as dirty until it mounts
     *          again. In flow mode, the queue a submit staged before the control unmounted (a
     *          stage that was left) is saved like the staged values, see useLazyCrudConnector.
     *          What counts for such a control is the value when it unmounts: while it is
     *          mounted its queue keeps the Form dirty and is saved, also when this changes.
     */
    onlySubmitMounted?: boolean;
    /**
     * Behaviour for "only submit mounted"
     * @default OnlySubmitMountedBehaviour.OMIT
     */
    onlySubmitMountedBehaviour?: OnlySubmitMountedBehaviour;
    /**
     * Fields to always be included during submit, regardless of onlySubmitMounted
     */
    alwaysSubmitFields?: ModelFieldNames<M>[];
    /**
     * List of fields which will always trigger validation warning even if onlyWarnChanged is enabled
     */
    alwaysWarnFields?: ModelFieldNames<M>[];
    /**
     * Only validate mounted fields
     */
    onlyValidateMounted?: boolean;
    /**
     * Only perform warning validations for mounted fields
     */
    onlyWarnMounted?: boolean;
    /**
     * Only perform warning validations for changed fields
     */
    onlyWarnChanged?: boolean;
    /**
     * Is the form read-only?
     * @deprecated use readOnlyReasons
     */
    readOnly?: boolean;
    /**
     * Optional read-only reason
     * @deprecated use readOnlyReasons instead
     */
    readOnlyReason?: string | null;
    /**
     * Read only reasons.
     * @type Record<unique-identifier, human-readable-reason-or-NULL>
     */
    readOnlyReasons?: Record<string, string | null>;
    /**
     * Disable Validations
     */
    disableValidation?: boolean;
    /**
     * Nested form name
     * Enables nested form mode if set to non-empty string
     * Form is submitted with main form submit. Does not support multiple layers of nesting
     * @remarks While its values differ from its record the parent is dirty (a custom dirty
     *          field named after it, see FormContextData.setCustomFieldDirty). A nested form
     *          that unmounts keeps its edits in the parent and gets them back when it mounts
     *          again; they keep the parent dirty and are saved by the parent's save, unless
     *          the parent has onlySubmitMounted or this form has onlySubmitNestedIfMounted.
     * @remarks In a flow form (the parent's flowEngine), a submit that only stages
     *          (goToStage without submitToServer) stages the nested form's edits along with
     *          the values of the shown stage and sends nothing. A nested form that unmounts
     *          with staged edits, as it does when its stage is left, keeps them for the
     *          flow's save: they count toward the parent's stagedDirty, and the next submit
     *          to the server submits the nested form. One hidden within its stage, with
     *          nothing staged since it mounted, follows the parent's onlySubmitMounted.
     */
    nestedFormName?: string;
    /**
     * Disables form submission
     * @remarks The parent form neither validates nor submits this form then, and its
     *          changes don't make the parent dirty
     */
    disableNestedSubmit?: boolean;
    /**
     * Submit nested form before parent instead of after
     * @remarks only affects nested forms. Use when the child record must exist before the parent is saved.
     * The `id` passed to `nestedFormPreSubmitHandler` will be the parent's pre-submit id (null on create).
     * In a flow form a submit that only stages does not submit the nested form, the flow's
     * save does (see nestedFormName).
     * @default false
     */
    nestedSubmitBeforeParent?: boolean;
    /**
     * Only submit nested form if it is currently mounted
     * @remarks only affects nested forms
     * @default false
     */
    onlySubmitNestedIfMounted?: boolean;
    /**
     * Submit preparation handler
     * Called after parent form submit, before this form submit
     * @param id The ID of the parent form (after submit). Null if nestedSubmitBeforeParent is set and the parent is being created (pre-submit id is null).
     * @param model The model currently in use (can be used to modify connector endpoints)
     * @param getFieldValue getFieldValue of this form
     * @param setFieldValueLite setFieldValueLite of this form
     */
    nestedFormPreSubmitHandler?: (id: string | null, model: M, getFieldValue: FormContextData<M>["getFieldValue"], setFieldValueLite: FormContextData<M>["setFieldValueLite"]) => Promise<void> | void;
    /**
     * CSS class for form styles
     */
    formClass?: string;
    /**
     * Disable routing for form
     * @remarks This is used to prevent errors when using forms in dialogs which don't support routing.
     *          It does not change what the leave guard of a dirty form asks: a navigation that
     *          keeps the nearest Route around the Form rendered at the same url passes without
     *          "Leave form page?" (e.g. routed tabs in the form page), as the Form stays mounted.
     */
    disableRouting?: boolean;
    /**
     * List of fields to ignore when calculating form dirty state.
     * Useful for frontend-only fields. Format: dot notation (e.g. object.sub-object.field OR field)
     */
    dirtyIgnoreFields?: string[];
    /**
     * Mark the modified fields, using the form's own per-field dirty state
     * @remarks Off by default: no control shows the marker unless asked. Where the
     *          application, not the form engine, decides what counts as modified, wrap the
     *          fields in a `DirtyStateProvider` instead.
     * @see DirtyStateContext
     */
    showDirtyState?: boolean;
    /**
     * Enable flow engine mode
     * @remarks The form has two dirty flags then: `dirty` for the values of the shown stage,
     *          `stagedDirty` for the values that stages staged and the flow has not saved yet.
     *          See FormContextData.dirty and FormContextData.stagedDirty.
     */
    flowEngine?: boolean;
    /**
     * Render form as div instead of form
     */
    renderFormAsDiv?: boolean;
    /**
     * Custom error renderer, defaults to Typography color=error
     */
    errorRenderer?: React.ComponentType<FormErrorRendererProps<CustomPropsT>>;
}
export interface FormErrorRendererProps<CustomPropsT> {
    /**
     * Custom props passed to Form in props
     */
    customProps: CustomPropsT;
    /**
     * The error to render
     */
    error: Error;
}
export declare const FormRenderAsDivContext: React.Context<boolean>;
/**
 * The key of FormContextData.readOnlyReasons under which a form is read-only while it
 * submits or is busy (FormContextData.submitting), with the text "The form is currently
 * being saved". Any other key means the form is read-only for another reason.
 */
export declare const FORM_SUBMITTING_READ_ONLY_REASON = "submit";
/**
 * The context of a form, typed by the form's model
 * @typeParam M The model of the form, ModelUnknown for code that works with any form
 * @typeParam CustomPropsT The custom props of the form
 */
export interface FormContextData<M extends ModelUnknown, CustomPropsT = unknown> {
    /**
     * The ID of the currently opened record
     */
    id: string | null;
    /**
     * The data model of this form
     */
    model: M;
    /**
     * The error component of this form
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Relations of the model
     */
    relations: ModelGetResponseRelations<M>;
    /**
     * Helper function to display errors
     * @param error The error to display
     */
    setError: (error: Error) => void;
    /**
     * Marks the field as mounted
     * @param field The field name
     * @param mounted Is mounted?
     */
    markFieldMounted: (field: string, mounted: boolean) => void;
    /**
     * Sets the callback to perform hard validation (for custom fields)
     * @param field custom field name (must not be in model)
     * @remarks Stays registered until it is removed, also after the component that set it
     *          unmounted. A Form given another record (id or model) drops it.
     */
    setCustomValidationHandler: (field: string, handler: CustomValidationHandler) => void;
    /**
     * Removes the callback to perform hard validation (for custom fields)
     * @param field custom field name (must not be in model)
     */
    removeCustomValidationHandler: (field: string) => void;
    /**
     * Sets the callback to perform soft validation (for custom fields)
     * @param field custom field name (must not be in model)
     * @remarks Stays registered until it is removed, also after the component that set it
     *          unmounted. A Form given another record (id or model) drops it.
     */
    setCustomWarningHandler: (field: string, handler: CustomValidationHandler) => void;
    /**
     * Removes the callback to perform soft validation (for custom fields)
     * @param field custom field name (must not be in model)
     */
    removeCustomWarningHandler: (field: string) => void;
    /**
     * Sets the pre submit handler (for custom fields)
     * @param field custom field name (must not be in model)
     * @remarks Stays registered until it is removed, also after the component that set it
     *          unmounted. A Form given another record (id or model) drops it.
     */
    setPreSubmitHandler: (field: string, handler: PreSubmitHandler) => void;
    /**
     * Removes a pre submit handler (for custom fields)
     * @param field custom field name (must not be in model)
     */
    removePreSubmitHandler: (field: string) => void;
    /**
     * Sets the post submit handler (for custom fields)
     * @param field custom field name (must not be in model)
     * @remarks Stays registered until it is removed, also after the component that set it
     *          unmounted. A Form given another record (id or model) drops it.
     */
    setPostSubmitHandler: (field: string, handler: PostSubmitHandler) => void;
    /**
     * Removes a post submit handler (for custom fields)
     * @param field custom field name (must not be in model)
     */
    removePostSubmitHandler: (field: string) => void;
    /**
     * Gets custom field state
     * @param field custom field name (must not be in model)
     */
    getCustomState: <T>(field: string) => T | undefined;
    /**
     * Sets custom field state
     * @param field custom field name (must not be in model)
     * @param data the set state action
     */
    setCustomState: <T>(field: string, data: Dispatch<SetStateAction<T | undefined>>) => void;
    /**
     * Tells whether custom field state is stored under the name
     * @param field custom field name (must not be in model)
     * @returns true once setCustomState wrote the name, also when it wrote null or
     *          undefined; false before
     */
    hasCustomState: (field: string) => boolean;
    /**
     * Set custom field dirty state
     * @param field The unique field name
     * @param dirty The dirty state: true while the field holds changes the form's save
     *              saves, false once it holds none. "staged" in a flow form
     *              (FormProps.flowEngine): the changes belong to a stage that was left and
     *              wait for the flow's save, so they count toward stagedDirty instead of
     *              dirty, as the staged values of that stage's fields do. Without flowEngine
     *              "staged" counts like true.
     * @remarks The same function for the life of the Form, so an effect that lists it (and
     *          clears its field in the cleanup) doesn't re-run when the Form re-renders.
     * @remarks The field keeps the last state set until it is set again: whatever sets it
     *          clears it once its changes are saved or undone.
     */
    setCustomFieldDirty: (field: string, dirty: boolean | "staged") => void;
    /**
     * Set form read only
     * @param ident A unique identifier triggering the read-only state
     * @param reason Optional reason for user
     */
    setCustomReadOnly: (ident: string, reason?: string) => void;
    /**
     * Set form read-write
     * @param ident The unique identifier that triggered the read-only state
     * @see setCustomReadOnly
     */
    removeCustomReadOnly: (ident: string) => void;
    /**
     * Subscribes to a form engine event
     * @param type The event type
     * @param listener The listener to call when the event is dispatched
     * @remarks Events are dispatched as soon as the form engine knows about the change,
     *          which may be before React has re-rendered with the new state. Use this
     *          instead of the rendered state where acting on a stale value is a bug,
     *          e.g. when navigating away right after awaiting submit.
     */
    addEventListener: FormEventTarget["addEventListener"];
    /**
     * Unsubscribes from a form engine event
     * @param type The event type
     * @param listener The listener previously passed to addEventListener
     * @see addEventListener
     */
    removeEventListener: FormEventTarget["removeEventListener"];
    /**
     * Is the form dirty? Do the values it submits differ from the server record, is a custom
     * field dirty (setCustomFieldDirty with true), or is the record deleted on submit
     * (deleteOnSubmit)?
     *
     * The server record is initialValues. For a new record that is the model's default record,
     * so the fields FormProps.initialRecord sets to another value count as changes.
     *
     * In flow mode (FormProps.flowEngine) the values are those the shown stage submits: the
     * fields it renders, alwaysSubmitFields and hidden fields, or every field when its stage
     * config turns onlySubmitMounted off. What earlier stages staged (goToStage without
     * submitToServer) and the stage does not submit again is not counted here but in
     * stagedDirty. A button that goes on to the next stage without saving (Next) follows this
     * flag. A button that saves (FlowEngineSaveButton, goToStage with submitToServer) saves the
     * shown stage's values and the staged ones, so it follows `dirty || stagedDirty`, and so
     * does every check whether the form holds unsaved changes.
     * @remarks This is rendered state, so it lags behind by a render. Subscribe to the
     *          "dirty" event to be notified the moment the form engine sees the change.
     * @see addEventListener
     * @see stagedDirty
     */
    dirty: boolean;
    /**
     * Flow mode (FormProps.flowEngine): do the values that stages staged (goToStage without
     * submitToServer) differ from the server record, or does a custom field hold staged
     * changes (setCustomFieldDirty with "staged", e.g. a nested form in a stage that was left)?
     * They are what the next save sends besides the values of the shown stage, also while the
     * stage that renders them is not shown.
     *
     * Set from the moment a stage change stages an edit until the flow saves it (goToStage
     * with submitToServer, FlowEngineSaveButton, submit with submitToServer), or until the
     * staged value is the server's again. Always false without flowEngine.
     *
     * The form holds unsaved changes while `dirty || stagedDirty`: the leave guard asks then
     * (closing the browser tab, a navigation away, closing a FullFormDialog, the form page's
     * goBack), and a Save button is enabled then. A Next button follows `dirty` alone.
     * @remarks This is rendered state, so it lags behind by a render; the "dirty" event
     *          carries it too.
     * @see dirty
     * @see addEventListener
     */
    stagedDirty: boolean;
    /**
     * Per-field dirty state: does the field's value differ from the server-side one?
     * @remarks One entry per model field, and nothing else. Custom (non-model) fields
     *          are absent on purpose: whatever reports one through setCustomFieldDirty
     *          already owns that state, and only contributes it to the form-wide flag.
     *
     *          An entry is the same flag a type renderer receives as
     *          `RenderParams.dirty`.
     */
    dirtyFields: Record<ModelFieldNames<M>, boolean>;
    /**
     * Was the form asked to mark its modified fields?
     * @remarks Whether a given field *is* marked is a different question, which a
     *          `DirtyStateProvider` can answer differently — ask `useDirtyState` for that.
     *          This is the form-wide switch, for a control which holds dirty state of its
     *          own and wants to display it on the same terms as the model fields.
     * @see FormProps.showDirtyState
     */
    showDirtyState: boolean;
    /**
     * @see FormProps.onlySubmitMounted
     */
    onlySubmitMounted: boolean;
    /**
     * @see FormProps.onlySubmitMountedBehaviour
     */
    onlySubmitMountedBehaviour: OnlySubmitMountedBehaviour;
    /**
     * @see FormProps.onlyValidateMounted
     */
    onlyValidateMounted: boolean;
    /**
     * @see FormProps.onlyWarnMounted
     */
    onlyWarnMounted: boolean;
    /**
     * @see FormProps.onlyWarnChanged
     */
    onlyWarnChanged: boolean;
    /**
     * @see FormProps.readOnly
     */
    readOnly: boolean;
    /**
     * First read-only reason
     * @see readOnlyReasons
     * @deprecated use readOnlyReasons
     */
    readOnlyReason: string | null | undefined;
    /**
     * Read only reasons
     * @see FormProps.readOnlyReasons
     * @see setCustomReadOnly
     * @remarks identifier "form-legacy" is used for compatibility
     * @remarks identifier FORM_SUBMITTING_READ_ONLY_REASON is set while the form submits or is busy
     */
    readOnlyReasons: Partial<Record<"form-legacy" | string, string | null>>;
    /**
     * Is the form being submitted, or busy (see addBusyReason)? While it is, the form's
     * root element (the `<form>`, or the `<div>` of a nested form and with
     * `renderFormAsDiv`) has `aria-busy="true"`, which tells assistive technology that
     * its content is changing.
     */
    submitting: boolean;
    /**
     * Adds a busy reason, which triggers isSubmitting to become true and form loading overlay to show
     * @param name The reason identifier
     * @param promise The promise to await to remove the busy reason
     * @remarks remove busy reason with removeBusyReason if no promise is set
     * @see removeBusyReason
     */
    addBusyReason: (name: string, promise?: Promise<unknown>) => void;
    /**
     * Removes a busy reason added by addBusyReason
     * @param name The reason identifier
     * @see addBusyReason
     */
    removeBusyReason: (name: string) => void;
    /**
     * Add a blocker for submitting
     * This is a feature to hide the form loading overlay when user interaction is required (e.g. a form dialog in a pre-submit handler)
     * Remove it again with removeSubmittingBlocker
     * @param name The name of the blocker
     * @see removeSubmittingBlocker
     */
    addSubmittingBlocker: (name: string) => void;
    /**
     * Removes the blocker added by addSubmittingBlocker
     * @param name The name of the blocker
     * @see addSubmittingBlocker
     */
    removeSubmittingBlocker: (name: string) => void;
    /**
     * Submit the form
     */
    submit: (params?: FormSubmitOptions | React.SyntheticEvent) => Promise<void>;
    /**
     * Submit the form, swallowing any error
     *
     * A shortcut for the `try { await submit(); } catch { /* ignore *\/ }` pattern. The error is
     * still stored and rendered by the form's errorComponent, and it is still passed to the global
     * error reporting config. This only stops the rejection from escaping.
     * @param params Same as submit
     * @returns false if submitting failed, true otherwise
     * @remarks true does NOT mean the record was saved: submit is a no-op if the form isn't dirty
     *          (unless FormSubmitOptions.ignoreDirtyCheck is set) and when a preSubmit handler
     *          cancels submission. Both return true.
     * @remarks Use submit if you need the error object itself.
     * @remarks Nested forms (see FormProps.nestedFormName) don't render an errorComponent of their
     *          own, so prefer submit there and let the error propagate to the parent form.
     * @see submit
     * @see configureErrorReporting
     */
    safeSubmit: (params?: FormSubmitOptions | React.SyntheticEvent) => Promise<boolean>;
    /**
     * Is the form record being deleted on submit
     */
    deleteOnSubmit: boolean;
    /**
     * The current form values
     */
    values: ModelRecord<M>;
    /**
     * The server record the values are compared with (the dirty baseline): the record as
     * loaded or last saved. For a new record that the form has not saved yet, the model's
     * default record, without FormProps.initialRecord, which is applied to the values as a
     * change. Empty before the record loaded.
     */
    initialValues: ModelRecord<M>;
    /**
     * The current validation errors
     */
    errors: Record<string, string | null>;
    /**
     * The current validation warnings (aka hints)
     */
    warnings: Record<string, string | null>;
    /**
     * The current field touched state
     */
    touched: Record<string, boolean>;
    /**
     * Sets a field value
     */
    setFieldValue: <FieldT extends ModelFieldNames<M>>(field: FieldT, value: ModelFieldValues<M>[FieldT], validate?: boolean, triggerOnChange?: boolean) => void;
    /**
     * Like setFieldValue but doesn't trigger validation
     * @param field The field
     * @param value The value
     * @see setFieldValue
     */
    setFieldValueLite: <FieldT extends ModelFieldNames<M>>(field: FieldT, value: ModelFieldValues<M>[FieldT]) => void;
    /**
     * Get a field value
     * @param field The field name
     */
    getFieldValue: <FieldT extends ModelFieldNames<M>>(field: FieldT) => ModelFieldValues<M>[FieldT];
    /**
     * Gets all current values
     */
    getFieldValues: () => ModelRecord<M>;
    /**
     * Handle input blur events
     * @remarks Marks the field touched; does not validate. The field is named by the
     *          first non-empty name, data-name or id attribute of the event's
     *          currentTarget, then of its target (the element that lost focus, e.g. the
     *          input inside a wrapper that has the handler). Logs an error when none is
     *          set. The library's date pickers name their blur event by their `name`.
     */
    handleBlur: React.FocusEventHandler<HTMLInputElement & HTMLElement>;
    /**
     * Set field touched state
     * @param field The field name
     * @param touched The new touched state
     * @param validate Should revalidate?
     */
    setFieldTouched: (field: ModelFieldNames<M>, touched?: boolean, validate?: boolean) => void;
    /**
     * Like setFieldTouched but doesn't trigger validation
     * @param field The field name
     * @param touched The new touched state
     * @see setFieldTouched
     */
    setFieldTouchedLite: (field: ModelFieldNames<M>, touched?: boolean) => void;
    /**
     * Resets the form to server values
     */
    resetForm: () => void;
    /**
     * Refetches data from server
     */
    refetchForm: QueryObserverBaseResult["refetch"];
    /**
     * Validates the form and returns a list of validation errors
     * If the returned object is empty no validation errors occurred.
     */
    validateForm: (mode?: "normal" | "hint") => Promise<ValidationResult> | ValidationResult;
    /**
     * Parent form context (if present and FormProps.nestedFormName is set)
     */
    parentFormContext: FormContextData<ModelUnknown> | null;
    /**
     * Custom props passed in props
     */
    customProps: CustomPropsT;
    /**
     * Flow engine mode enabled?
     */
    flowEngine: boolean;
    /**
     * Flow engine config
     */
    flowEngineConfig: React.MutableRefObject<FormFlowEngineStageConfig>;
}
/**
 * Context which stores information about the current form so it can be used by fields
 */
export declare const FormContext: React.Context<FormContextData<ModelUnknown, unknown> | null>;
/**
 * Requires the model type argument of the form context hooks: a call without one doesn't compile
 */
export type FormContextModelTypeRequired<M> = [M] extends [never] ? [modelTypeArgumentRequired: never] : [];
/**
 * The context of the form this component is rendered in
 * @typeParam M The model of the form (required), ModelUnknown for code that works with any form
 * @typeParam CustomPropsT The custom props of the form
 * @remarks M is not checked against the model the form actually uses
 */
export declare const useFormContext: <M extends ModelUnknown = never, CustomPropsT = unknown>(..._modelTypeRequired: FormContextModelTypeRequired<M>) => FormContextData<M, CustomPropsT>;
/**
 * The part of the form context that does not change with the form's values: the record, the
 * form's state flags and its stable callbacks, among them those of custom fields (custom
 * state, dirty flag, validation, warning, pre- and post-submit handlers)
 * @typeParam M The model of the form, ModelUnknown for code that works with any form
 * @typeParam CustomPropsT The custom props of the form
 * @remarks Its value changes with id, model, customProps, the read-only reasons, submitting,
 *          dirty and stagedDirty, but not with a value, an error, a warning or a touched flag,
 *          so a control that reads only this context (useFormContextLite) does not render
 *          again while the user types into another field. getFieldValue and getFieldValues
 *          read the latest values without subscribing to them.
 */
export type FormContextDataLite<M extends ModelUnknown, CustomPropsT = unknown> = Pick<FormContextData<M, CustomPropsT>, "id" | "model" | "customProps" | "onlySubmitMounted" | "onlyValidateMounted" | "onlyWarnMounted" | "onlyWarnChanged" | "readOnly" | "readOnlyReason" | "readOnlyReasons" | "errorComponent" | "initialValues" | "getFieldValue" | "getFieldValues" | "setFieldValueLite" | "setFieldTouchedLite" | "setCustomReadOnly" | "removeCustomReadOnly" | "setCustomValidationHandler" | "removeCustomValidationHandler" | "setCustomWarningHandler" | "removeCustomWarningHandler" | "setPreSubmitHandler" | "removePreSubmitHandler" | "setPostSubmitHandler" | "removePostSubmitHandler" | "getCustomState" | "setCustomState" | "hasCustomState" | "setCustomFieldDirty" | "addEventListener" | "removeEventListener" | "flowEngine" | "submit" | "safeSubmit" | "submitting" | "dirty" | "stagedDirty" | "showDirtyState" | "flowEngineConfig" | "refetchForm">;
export declare const FormContextLite: React.Context<FormContextDataLite<ModelUnknown, unknown> | null>;
/**
 * The lite context of the form this component is rendered in
 * @see useFormContext
 */
export declare const useFormContextLite: <M extends ModelUnknown = never, CustomPropsT = unknown>(..._modelTypeRequired: FormContextModelTypeRequired<M>) => FormContextDataLite<M, CustomPropsT>;
export interface FormNestedState {
    valuesStaged: Record<string, unknown>;
    valuesStagedModified: Record<string, boolean>;
    values: Record<string, unknown>;
    touched: Record<string, boolean>;
    errors: Record<string, string | null>;
    warnings: Record<string, string | null>;
}
export type FormFlowEngineStageConfig = Partial<{
    onlySubmitMounted: boolean;
    onlySubmitMountedBehaviour: OnlySubmitMountedBehaviour;
    alwaysSubmitFields: string[];
    alwaysWarnFields: string[];
}>;
export declare const useFormFlowEngineStageConfig: (config: FormFlowEngineStageConfig) => void;
export type FormClassKey = "root";
declare const Form: <M extends ModelUnknown, CustomPropsT>(props: FormProps<M, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof Form;
export default _default;
