import React, { Dispatch, SetStateAction } from "react";
import Model, { ModelFieldName, ModelGetResponseRelations, PageVisibility } from "../../backend-integration/Model/Model";
import { QueryObserverBaseResult } from "react-query/types/core/types";
export declare type ValidationError = Record<string, string>;
/**
 * Pre submit handler for additional validations
 * Throw to cancel submit and display error.
 * Thrown error may be a ValidationError or an normal Error (other error)
 */
export declare type CustomValidationHandler = () => Promise<ValidationError> | ValidationError;
/**
 * Pre submit handler to perform final changes (bypassing validation)
 */
export declare type PreSubmitHandler = (id: string | null, submitOptions: FormSubmitOptions) => Promise<void> | unknown;
/**
 * Post submit handler to submit additional data for the submitted record
 */
export declare type PostSubmitHandler = (id: string, submitOptions: FormSubmitOptions) => Promise<void> | unknown;
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
export interface PreSubmitParams {
    /**
     * The remote data
     */
    readonly serverData: Record<string, unknown>;
    /**
     * The local data
     */
    readonly formData: Record<string, unknown>;
    /**
     * submit options
     */
    readonly submitOptions: FormSubmitOptions;
    readonly deleteOnSubmit: boolean;
    readonly setFieldValue: FormContextData["setFieldValue"];
}
export interface ErrorComponentProps {
    /**
     * The last error that happened
     */
    error: Error | ValidationError;
}
export declare type FormSubmitOptions = Partial<{
    ignoreWarnings: boolean;
}>;
export interface PageProps<KeyT extends ModelFieldName, CustomPropsT> {
    /**
     * Indicates if the form is currently being submitted.
     * All submit buttons should be disabled if "isSubmitting" is true.
     */
    isSubmitting: boolean;
    /**
     * Is the form dirty?
     */
    dirty: boolean;
    /**
     * Has the form disableRouting flag?
     * @see FormProps disableRouting
     */
    disableRouting: boolean;
    /**
     * The values of the form, can be used for conditional rendering.
     * Only present if renderConditionally is set to true in FormProps
     */
    values?: Record<string, unknown>;
    /**
     * Function to trigger form submit
     */
    submit: (params?: FormSubmitOptions | React.SyntheticEvent) => Promise<void>;
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
export interface FormProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT, CustomPropsT> {
    /**
     * The data model this form follows
     */
    model: Model<KeyT, VisibilityT, CustomT>;
    /**
     * The current data entry id
     */
    id: string | null;
    /**
     * Initial record to use (instead of defaults from model)
     * @remarks Only loaded if ID is null
     */
    initialRecord?: Record<string, unknown>;
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * The form contents
     */
    children: React.ComponentType<PageProps<KeyT, CustomPropsT>>;
    /**
     * Rerender page props if values changes
     */
    renderConditionally?: boolean;
    /**
     * Pre-submit callback to cancel submission
     * @param params The params provded
     * @return should cancel? false for continue, true for cancel
     */
    preSubmit?: (params: PreSubmitParams) => Promise<boolean> | boolean;
    /**
     * Called upon successful submit
     * Contains data from server response
     * @param dataFromServer The data from the server response (model data)
     * @param submittedData The data submitted by the form
     * @param previousData The data previously provided by the server
     */
    onSubmit?: (dataFromServer: Record<string, unknown>, submittedData: Record<string, unknown>, previousData: Record<string, unknown>) => Promise<void> | void;
    /**
     * Delete the record on submit rather then save it?
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
    alwaysSubmitFields?: string[];
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
     */
    nestedFormName?: string;
    /**
     * Disables form submission
     */
    disableNestedSubmit?: boolean;
    /**
     * Only submit nested form if it is currently mounted
     * @remarks only affects nested forms
     * @default false
     */
    onlySubmitNestedIfMounted?: boolean;
    /**
     * Submit preparation handler
     * Called after parent form submit, before this form submit
     * @param id The ID of the parent form (after submit)
     * @param model The model currently in use (can be used to modify connector endpoints)
     */
    nestedFormPreSubmitHandler?: (id: string, model: Model<ModelFieldName, PageVisibility, unknown>) => Promise<void> | unknown;
    /**
     * CSS class for form styles
     */
    formClass?: string;
    /**
     * Disable routing for form
     * @remarks This is used to prevent errors when using forms in dialogs which don't support routing
     */
    disableRouting?: boolean;
    /**
     * List of fields to ignore when calculating form dirty state.
     * Useful for frontend-only fields. Format: dot notation (e.g. object.sub-object.field OR field)
     */
    dirtyIgnoreFields?: string[];
}
export interface FormContextData {
    /**
     * The ID of the currently opened record
     */
    id: string | null;
    /**
     * The data model of this form
     */
    model: Model<ModelFieldName, PageVisibility, never>;
    /**
     * The error component of this form
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Relations of the model
     */
    relations: ModelGetResponseRelations<ModelFieldName>;
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
     * Set dirty custom field count (for fields modified by post submit handlers)
     * @deprecated Use setCustomFieldDirty instead
     */
    setCustomDirtyCounter: Dispatch<SetStateAction<number>>;
    /**
     * Set custom field dirty state
     * @param field The unique field name
     * @param dirty The dirty state
     */
    setCustomFieldDirty: (field: string, dirty: boolean) => void;
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
     * Is the form dirty?
     */
    dirty: boolean;
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
     */
    readOnlyReasons: Partial<Record<"form-legacy" | string, string | null>>;
    /**
     * Is the form being submitted
     */
    submitting: boolean;
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
     * Is the form record being deleted on submit
     */
    deleteOnSubmit: boolean;
    /**
     * The current form values
     */
    values: Record<string, unknown>;
    /**
     * The initial form values
     */
    initialValues: Record<string, unknown>;
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
    setFieldValue: (field: string, value: unknown, validate?: boolean, triggerOnChange?: boolean) => void;
    /**
     * Like setFieldValue but doesn't trigger validation
     * @param field The field
     * @param value The value
     * @see setFieldValue
     */
    setFieldValueLite: (field: string, value: unknown) => void;
    /**
     * Get a field value
     * @param field The field name
     */
    getFieldValue: (field: string) => unknown;
    /**
     * Gets all current values
     */
    getFieldValues: () => Record<string, unknown>;
    /**
     * Handle input blur events
     */
    handleBlur: React.FocusEventHandler<HTMLInputElement & HTMLElement>;
    /**
     * Set field touched state
     * @param field The field name
     * @param touched The new touched state
     * @param validate Should revalidate?
     */
    setFieldTouched: (field: string, touched?: boolean, validate?: boolean) => void;
    /**
     * Like setFieldTouched but doesn't trigger validation
     * @param field The field name
     * @param touched The new touched state
     * @see setFieldTouched
     */
    setFieldTouchedLite: (field: string, touched?: boolean) => void;
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
    validateForm: (mode?: "normal" | "hint") => Promise<ValidationError> | ValidationError;
    /**
     * Parent form context (if present and FormProps.nestedFormName is set)
     */
    parentFormContext: FormContextData | null;
    /**
     * Custom props passed in props
     */
    customProps: unknown;
}
/**
 * Context which stores information about the current form so it can be used by fields
 */
export declare const FormContext: React.Context<FormContextData | null>;
export declare const useFormContext: () => FormContextData;
export declare type FormContextDataLite = Pick<FormContextData, "id" | "model" | "customProps" | "onlySubmitMounted" | "onlyValidateMounted" | "onlyWarnMounted" | "onlyWarnChanged" | "readOnly" | "readOnlyReason" | "readOnlyReasons" | "errorComponent" | "getFieldValue" | "getFieldValues" | "setFieldValueLite" | "setFieldTouchedLite">;
export declare const FormContextLite: React.Context<FormContextDataLite | null>;
export declare const useFormContextLite: () => FormContextDataLite;
export interface FormNestedState {
    values: Record<string, unknown>;
    touched: Record<string, boolean>;
    errors: Record<string, string | null>;
    warnings: Record<string, string | null>;
}
declare const _default: <KeyT extends string, VisibilityT extends PageVisibility, CustomT, CustomPropsT>(props: FormProps<KeyT, VisibilityT, CustomT, CustomPropsT>) => JSX.Element;
export default _default;
