import React, {
	CSSProperties,
	Dispatch,
	FormEvent,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Model, {
	ModelFieldName,
	ModelGetResponseRelations,
	PageVisibility,
	useModelDelete,
	useModelGet,
	useModelMutation,
} from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import {
	dotInObject,
	dotSet,
	dotsToObject,
	dotToObject,
	getValueByDot,
} from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isObjectEmpty from "../../utils/isObjectEmpty";
import { Grid, styled, Typography } from "@mui/material";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { showConfirmDialogBool } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { useDialogContext } from "../../framework";
import deepSort from "../../utils/deepSort";
import useDevKeybinds from "../../utils/useDevKeybinds";
import uniqueArray from "../../utils/uniqueArray";
import { QueryObserverBaseResult } from "@tanstack/react-query";
import ValidationError from "./ValidationError";

// optional import
let captureException: ((e: Error) => void) | null = null;
import("@sentry/react")
	.then((Sentry) => (captureException = Sentry.captureException))
	.catch(() => {}); // ignore

export type ValidationResult = Record<string, string>;
/**
 * Pre submit handler for additional validations
 * Throw to cancel submit and display error.
 * Thrown error may be a ValidationError or a normal Error (other error)
 */
export type CustomValidationHandler = () =>
	| Promise<ValidationResult>
	| ValidationResult;
/**
 * Pre submit handler to perform final changes (bypassing validation)
 */
export type PreSubmitHandler = (
	id: string | null,
	submitOptions: FormSubmitOptions,
) => Promise<void> | void;
/**
 * Post submit handler to submit additional data for the submitted record
 */
export type PostSubmitHandler = (
	id: string,
	submitOptions: FormSubmitOptions,
) => Promise<void> | void;

export enum OnlySubmitMountedBehaviour {
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
	NULL = "null",
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
	// select form props follow, @see docs in interface FormProps
	readonly deleteOnSubmit: boolean;
	// select helpers follow, @see docs in interface FormContextData
	readonly setFieldValue: FormContextData["setFieldValue"];
}

export interface ErrorComponentProps {
	/**
	 * The last error that happened
	 */
	error: Error | ValidationError;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export interface FormProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	CustomPropsT,
> {
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
	 * @param params The params provided
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
	onSubmit?: (
		dataFromServer: Record<string, unknown>,
		submittedData: Record<string, unknown>,
		previousData: Record<string, unknown>,
	) => Promise<void> | void;
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
	 * List of fields which will always trigger validation warning even if onlyWarnChanged is enabled
	 */
	alwaysWarnFields?: string[];
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
	 * @param getFieldValue getFieldValue of this form
	 * @param setFieldValueLite setFieldValueLite of this form
	 */
	nestedFormPreSubmitHandler?: (
		id: string,
		model: Model<ModelFieldName, PageVisibility, unknown>,
		getFieldValue: FormContextData["getFieldValue"],
		setFieldValueLite: FormContextData["setFieldValueLite"],
	) => Promise<void> | void;
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
	/**
	 * Enable flow engine mode
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

export const FormRenderAsDivContext = React.createContext(false);

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
	setCustomValidationHandler: (
		field: string,
		handler: CustomValidationHandler,
	) => void;
	/**
	 * Removes the callback to perform hard validation (for custom fields)
	 * @param field custom field name (must not be in model)
	 */
	removeCustomValidationHandler: (field: string) => void;
	/**
	 * Sets the callback to perform soft validation (for custom fields)
	 * @param field custom field name (must not be in model)
	 */
	setCustomWarningHandler: (
		field: string,
		handler: CustomValidationHandler,
	) => void;
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
	setCustomState: <T>(
		field: string,
		data: Dispatch<SetStateAction<T | undefined>>,
	) => void;
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
	setFieldValue: (
		field: string,
		value: unknown,
		validate?: boolean,
		triggerOnChange?: boolean,
	) => void;
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
	setFieldTouched: (
		field: string,
		touched?: boolean,
		validate?: boolean,
	) => void;
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
	validateForm: (
		mode?: "normal" | "hint",
	) => Promise<ValidationResult> | ValidationResult;
	/**
	 * Parent form context (if present and FormProps.nestedFormName is set)
	 */
	parentFormContext: FormContextData | null;
	/**
	 * Custom props passed in props
	 */
	customProps: unknown;
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
export const FormContext = React.createContext<FormContextData | null>(null);
export const useFormContext = (): FormContextData => {
	const ctx = useContext(FormContext);
	if (!ctx) throw new Error("Form Context not set. Not using form engine?");
	return ctx;
};

export type FormContextDataLite = Pick<
	FormContextData,
	| "id"
	| "model"
	| "customProps"
	| "onlySubmitMounted"
	| "onlyValidateMounted"
	| "onlyWarnMounted"
	| "onlyWarnChanged"
	| "readOnly"
	| "readOnlyReason"
	| "readOnlyReasons"
	| "errorComponent"
	| "initialValues"
	| "getFieldValue"
	| "getFieldValues"
	| "setFieldValueLite"
	| "setFieldTouchedLite"
	| "setCustomReadOnly"
	| "removeCustomReadOnly"
	| "flowEngine"
	| "submit"
	| "submitting"
	| "dirty"
	| "flowEngineConfig"
>;
export const FormContextLite = React.createContext<FormContextDataLite | null>(
	null,
);
export const useFormContextLite = (): FormContextDataLite => {
	const ctx = useContext(FormContextLite);
	if (!ctx)
		throw new Error("Form Context (Lite) not set. Not using form engine?");
	return ctx;
};

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

export const useFormFlowEngineStageConfig = (
	config: FormFlowEngineStageConfig,
) => {
	const { flowEngineConfig } = useFormContextLite();
	useEffect(() => {
		flowEngineConfig.current = config;
		return () => {
			flowEngineConfig.current = {};
		};
	}, [config, flowEngineConfig]);
};

const loaderContainerStyles: CSSProperties = {
	height: 320,
	width: 320,
	margin: "auto",
};

interface DirtyDetectionConfig {
	/**
	 * List of fields to ignore (nulled internally)
	 */
	ignoreFields: string[] | undefined | null;
	/**
	 * The model
	 */
	model: Model<string, PageVisibility, unknown>;
	/**
	 * only submit mounted config
	 */
	onlySubmitMounted: boolean;
	onlySubmitMountedBehaviour: OnlySubmitMountedBehaviour;
	alwaysSubmitFields: string[];
	defaultRecord: Record<string, unknown>;
	/**
	 * mounted fields
	 */
	mountedFields: Record<string, boolean>;
}

const getUpdateData = (
	values: Record<string, unknown>,
	model: Model<string, PageVisibility, unknown>,
	onlySubmitMounted: boolean,
	onlySubmitMountedBehaviour: OnlySubmitMountedBehaviour,
	alwaysSubmitFields: string[],
	mountedFields: Record<string, boolean>,
	defaultRecord: Record<string, unknown>,
	id: string | null,
) => {
	const isMounted = (key: string): boolean =>
		key === "id" ||
		alwaysSubmitFields.includes(key) ||
		mountedFields[key] ||
		getVisibility(
			model.fields[key].visibility[id ? "edit" : "create"],
			values,
			values,
		).hidden;

	const data = !onlySubmitMounted
		? values
		: (() => {
				const result: Record<string, unknown> = {};
				const behaviour = onlySubmitMountedBehaviour;
				for (const field in model.fields) {
					const mounted = isMounted(field);
					if (mounted) {
						result[field] = getValueByDot(field, values);
						continue;
					}
					if (behaviour === OnlySubmitMountedBehaviour.OMIT) {
						// no action
					} else if (behaviour === OnlySubmitMountedBehaviour.NULL) {
						result[field] = null;
					} else if (behaviour === OnlySubmitMountedBehaviour.DEFAULT) {
						result[field] = getValueByDot(field, defaultRecord);
					} else {
						throw new Error(
							`Invalid onlySubmitMountedBehaviour ${behaviour as string}`,
						);
					}
				}
				return dotsToObject(result);
			})();
	if (id === "singleton") return { ...data, id };
	return data;
};

/**
 * Normalizes data for validation to ensure dirty flag matches user perception
 * @param data The data to normalize
 * @param config The config
 */
const normalizeValues = <T,>(data: T, config: DirtyDetectionConfig): T => {
	if (typeof data !== "object")
		throw new Error("Only Record<string, unknown> supported");

	const {
		ignoreFields,
		model,
		onlySubmitMounted,
		onlySubmitMountedBehaviour,
		alwaysSubmitFields,
		mountedFields,
		defaultRecord,
	} = config;

	data = getUpdateData(
		data as unknown as Record<string, unknown>,
		model,
		onlySubmitMounted,
		onlySubmitMountedBehaviour,
		alwaysSubmitFields,
		mountedFields,
		defaultRecord,
		(data as unknown as Record<"id", string | null>).id,
	) as T;

	let normalizedData: Record<string, unknown> = {};
	Object.entries(data as Record<string, unknown>).forEach(([k, v]) => {
		const shouldBeNulled = v === "" || (Array.isArray(v) && v.length === 0);
		normalizedData[k] = shouldBeNulled ? null : v;
	});
	if (ignoreFields) {
		ignoreFields.forEach((field) => {
			normalizedData = dotSet(field, normalizedData, null);
		});
	}

	return deepSort(normalizedData) as T;
};

const setAllTouched = (
	touched: Record<string, boolean>,
	set: boolean,
): Record<string, boolean> =>
	Object.fromEntries(Object.keys(touched).map((field) => [field, set]));

const StyledForm = styled("form", { name: "CcForm", slot: "root" })({});
const StyledFormDiv = styled("div", { name: "CcForm", slot: "root" })({});

export type FormClassKey = "root";

const Form = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	CustomPropsT,
>(
	props: FormProps<KeyT, VisibilityT, CustomT, CustomPropsT>,
) => {
	const {
		model,
		id,
		children,
		onSubmit,
		customProps,
		onlyWarnMounted,
		onlyWarnChanged,
		readOnly: readOnlyProp,
		readOnlyReason: readOnlyReasonProp,
		readOnlyReasons: readOnlyReasonsProp,
		disableValidation,
		nestedFormName,
		disableNestedSubmit,
		nestedFormPreSubmitHandler,
		deleteOnSubmit,
		onDeleted,
		initialRecord,
		formClass,
		preSubmit,
		dirtyIgnoreFields,
		flowEngine,
		renderFormAsDiv: renderFormAsDivProp,
		errorRenderer: ErrorRenderer,
	} = props;
	const renderFormAsDiv =
		useContext(FormRenderAsDivContext) || renderFormAsDivProp;
	// flow engine mode defaults
	const flowEngineConfig = useRef<FormFlowEngineStageConfig>({});
	const onlyValidateMounted = flowEngine ? true : props.onlyValidateMounted;
	const onlySubmitNestedIfMounted = flowEngine
		? false
		: props.onlySubmitNestedIfMounted;
	const onlySubmitMounted = flowEngine
		? (flowEngineConfig.current.onlySubmitMounted ?? true)
		: props.onlySubmitMounted;

	//
	const onlySubmitMountedBehaviour =
		flowEngineConfig.current.onlySubmitMountedBehaviour ??
		props.onlySubmitMountedBehaviour ??
		OnlySubmitMountedBehaviour.OMIT;
	const ErrorComponent = props.errorComponent;
	const { t } = useCCTranslations();
	const [pushDialog] = useDialogContext();

	// custom fields - dirty state
	// v1
	const [customDirtyCounter, setCustomDirtyCounter] = useState(0);
	// v2
	const [customDirtyFields, setCustomDirtyFields] = useState<string[]>([]);

	const setCustomFieldDirty = useCallback((field: string, dirty: boolean) => {
		setCustomDirtyFields((prev) => {
			const prevDirty = prev.includes(field);
			if (prevDirty == dirty) return prev; // no changes
			if (dirty) return [...prev, field];
			else return prev.filter((candidate) => candidate !== field);
		});
	}, []);

	const customDirty = customDirtyCounter > 0 || customDirtyFields.length > 0;

	// custom fields - pre submit handlers
	const preSubmitHandlers = useRef<Record<string, PreSubmitHandler>>({});
	const setPreSubmitHandler = useCallback(
		(field: string, handler: PreSubmitHandler) => {
			preSubmitHandlers.current[field] = handler;
		},
		[],
	);
	const removePreSubmitHandler = useCallback((field: string) => {
		delete preSubmitHandlers.current[field];
	}, []);
	// custom fields - custom validation handlers
	const customValidationHandlers = useRef<
		Record<string, CustomValidationHandler>
	>({});
	const setCustomValidationHandler = useCallback(
		(field: string, handler: CustomValidationHandler) => {
			customValidationHandlers.current[field] = handler;
		},
		[],
	);
	const removeCustomValidationHandler = useCallback((field: string) => {
		delete customValidationHandlers.current[field];
	}, []);
	// custom fields - custom warning handlers
	const customWarningHandlers = useRef<Record<string, CustomValidationHandler>>(
		{},
	);
	const setCustomWarningHandler = useCallback(
		(field: string, handler: CustomValidationHandler) => {
			customWarningHandlers.current[field] = handler;
		},
		[],
	);
	const removeCustomWarningHandler = useCallback((field: string) => {
		delete customWarningHandlers.current[field];
	}, []);

	// custom fields - post submit handlers
	const postSubmitHandlers = useRef<Record<string, PostSubmitHandler>>({});
	const setPostSubmitHandler = useCallback(
		(field: string, handler: PostSubmitHandler) => {
			postSubmitHandlers.current[field] = handler;
		},
		[],
	);
	const removePostSubmitHandler = useCallback((field: string) => {
		delete postSubmitHandlers.current[field];
	}, []);

	// custom fields - state
	const customFieldState = useRef<Record<string, unknown>>({});
	const getCustomState = useCallback(
		<T,>(field: string): T => customFieldState.current[field] as T,
		[],
	);
	const setCustomState = useCallback(
		<T,>(field: string, value: Dispatch<SetStateAction<T | undefined>>) => {
			customFieldState.current[field] =
				typeof value === "function"
					? value(customFieldState.current[field] as T | undefined)
					: value;
		},
		[],
	);

	// custom read-only
	const [customReadOnlyReasons, setCustomReadOnlyReasons] = useState<
		Record<string, string | null>
	>({});
	const setCustomReadOnly = useCallback(
		(ident: string, reason?: string | null) => {
			setCustomReadOnlyReasons((prev) => {
				return {
					...prev,
					[ident]: reason ?? null,
				};
			});
		},
		[],
	);
	const removeCustomReadOnly = useCallback((ident: string) => {
		setCustomReadOnlyReasons((prev) => {
			const newReaons = { ...prev };
			delete newReaons[ident];
			return newReaons;
		});
	}, []);

	// main form handling
	const [deleted, setDeleted] = useState(false);
	useEffect(() => {
		// clear deleted state upon id change
		setDeleted(false);
	}, [id]);
	const {
		isLoading,
		error,
		data: serverData,
		refetch,
	} = useModelGet(model, deleted ? null : id || null);
	const { mutateAsync: updateData } = useModelMutation(model);
	const { mutateAsync: deleteRecord } = useModelDelete(model);
	const {
		isLoading: isDefaultRecordLoading,
		data: defaultRecord,
		error: defaultRecordError,
	} = useModelGet(model, null);
	const getDefaultTouched = useCallback(
		() =>
			Object.fromEntries(Object.keys(model.fields).map((key) => [key, false])),
		[model],
	);

	const [updateError, setUpdateError] = useState<
		Error | ValidationError | null
	>(null);
	const valuesStagedRef = useRef<Record<string, unknown>>({});
	const [valuesStaged, setValuesStaged] = useState<Record<string, unknown>>({});
	const valuesStagedModifiedRef = useRef<Record<string, boolean>>({});
	const [valuesStagedModified, setValuesStagedModified] = useState<
		Record<string, boolean>
	>({});
	const valuesRef = useRef<Record<string, unknown>>({});
	const [values, setValues] = useState<Record<string, unknown>>({});
	const touchedRef = useRef<Record<string, boolean>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [errors, setErrors] = useState<Record<string, string | null>>({});
	const [warnings, setWarnings] = useState<Record<string, string | null>>({});
	const [submittingForm, setSubmittingForm] = useState(false);
	const [submittingOther, setSubmittingOther] = useState<string[]>([]);
	const removeBusyReason = useCallback((name: string) => {
		setSubmittingOther((prev) => prev.filter((e) => e !== name));
	}, []);
	const addBusyReason = useCallback(
		(name: string, promise?: Promise<unknown>) => {
			setSubmittingOther((prev) => [...prev, name]);
			if (promise) void promise.finally(() => removeBusyReason(name));
		},
		[removeBusyReason],
	);
	const [submittingBlocked, setSubmittingBlocked] = useState(false);
	const [submittingBlocker, setSubmittingBlocker] = useState<string[]>([]);
	const addSubmittingBlocker = useCallback((name: string) => {
		setSubmittingBlocker((prev) => [...prev, name]);
	}, []);
	const removeSubmittingBlocker = useCallback((name: string) => {
		setSubmittingBlocker((prev) => prev.filter((entry) => entry !== name));
	}, []);
	const submitting =
		(submittingForm || submittingOther.length > 0) &&
		!submittingBlocked &&
		submittingBlocker.length === 0;

	// main form handling - read-only
	const readOnlyReasons = useMemo((): Record<string, string | null> => {
		const legacy: Record<string, string | null> = readOnlyProp
			? { "form-legacy": readOnlyReasonProp ?? null }
			: {};
		const submitReadOnly: Record<string, string | null> = submitting
			? {
					submit: t("backend-components.form.read-only.submitting") ?? null,
				}
			: {};
		return {
			...legacy,
			...submitReadOnly,
			...readOnlyReasonsProp,
			...customReadOnlyReasons,
		};
	}, [
		readOnlyProp,
		readOnlyReasonProp,
		readOnlyReasonsProp,
		customReadOnlyReasons,
		submitting,
		t,
	]);
	const readOnly = !isObjectEmpty(readOnlyReasons);

	// main form handling - validation disable toggle
	useEffect(() => {
		if (!disableValidation) return;
		setErrors({});
		setWarnings({});
	}, [disableValidation]);

	// main form handling - mounted state tracking
	const [mountedFields, setMountedFields] = useState(() =>
		Object.fromEntries(
			Object.keys(model.fields).map((field) => [field, false]),
		),
	);
	const markFieldMounted = useCallback((field: string, mounted: boolean) => {
		setMountedFields((prev) => ({ ...prev, [field as KeyT]: mounted }));
	}, []);

	// main form handling - dirty state
	const initialValues = useMemo(
		() =>
			serverData
				? deepAssign(
						{},
						serverData[0],
						serverData[0].id || !initialRecord ? {} : initialRecord,
					)
				: undefined,
		[serverData, initialRecord],
	);
	const alwaysSubmitFields = useMemo(
		() =>
			uniqueArray([
				...(props.alwaysSubmitFields ?? []),
				...(flowEngineConfig.current.alwaysSubmitFields ?? []),
			]),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[props.alwaysSubmitFields, flowEngineConfig.current.alwaysSubmitFields],
	);
	const getNormalizedData = useCallback(
		(values?: Record<string, unknown>) => {
			if (!initialValues) {
				throw new Error("No server data (initialValues)");
			}
			if (!defaultRecord) {
				throw new Error("No default record");
			}
			const localData = normalizeValues(values ?? valuesRef.current, {
				ignoreFields: dirtyIgnoreFields,
				model: model as unknown as Model<string, PageVisibility, unknown>,
				defaultRecord: defaultRecord[0],
				onlySubmitMountedBehaviour,
				onlySubmitMounted: onlySubmitMounted ?? false,
				alwaysSubmitFields,
				mountedFields,
			});

			const remoteData = normalizeValues(initialValues, {
				ignoreFields: dirtyIgnoreFields,
				model: model as unknown as Model<string, PageVisibility, unknown>,
				defaultRecord: defaultRecord[0],
				onlySubmitMountedBehaviour,
				onlySubmitMounted: onlySubmitMounted ?? false,
				alwaysSubmitFields,
				mountedFields,
			});
			return [localData, remoteData];
		},
		[
			initialValues,
			defaultRecord,
			dirtyIgnoreFields,
			model,
			onlySubmitMountedBehaviour,
			onlySubmitMounted,
			alwaysSubmitFields,
			mountedFields,
		],
	);

	const getFormDirty = useCallback(
		(values: Record<string, unknown>) =>
			serverData && defaultRecord
				? (() => {
						const [local, remote] = getNormalizedData(values);
						return JSON.stringify(local) !== JSON.stringify(remote);
					})()
				: false,
		[serverData, defaultRecord, getNormalizedData],
	);
	const formDirty = useMemo(() => getFormDirty(values), [getFormDirty, values]);
	const getDirty = useCallback(
		(formDirty: boolean) =>
			formDirty || customDirty || !!(id && !deleted && deleteOnSubmit),
		[customDirty, deleteOnSubmit, deleted, id],
	);
	const dirty = getDirty(formDirty);

	// main form handling - dispatch
	const alwaysWarnFields = useMemo(
		() =>
			(props.alwaysWarnFields ?? []).concat(
				flowEngineConfig.current.alwaysWarnFields ?? [],
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[props.alwaysSubmitFields, flowEngineConfig.current.alwaysWarnFields],
	);
	const validateForm = useCallback(
		async (
			mode: "normal" | "hint" = "normal",
			values?: Record<string, unknown>,
		) => {
			if (disableValidation) return {};

			let fieldsToValidate: KeyT[] = Object.keys(model.fields) as KeyT[];
			if (onlyValidateMounted || (mode === "hint" && onlyWarnMounted)) {
				fieldsToValidate = fieldsToValidate.filter(
					(field) =>
						(field in mountedFields && mountedFields[field]) ||
						alwaysSubmitFields.includes(field),
				);
			}
			if (mode === "hint" && onlyWarnChanged) {
				const [localData, remoteData] = getNormalizedData(values);
				fieldsToValidate = fieldsToValidate.filter(
					(field) =>
						alwaysWarnFields.includes(field) ||
						JSON.stringify(getValueByDot(field, localData)) !==
							JSON.stringify(getValueByDot(field, remoteData)),
				);
			}

			const errors = await model.validate(
				values ?? valuesRef.current,
				id ? "edit" : "create",
				fieldsToValidate,
				mode,
			);
			await Promise.all(
				Object.entries(
					mode === "normal"
						? customValidationHandlers.current
						: customWarningHandlers.current,
				).map(async ([name, handler]) => {
					const customErrors = await handler();
					for (const key in customErrors) {
						if (!Object.prototype.hasOwnProperty.call(customErrors, key))
							continue;
						errors[name + "_" + key] = customErrors[key];
					}
				}),
			);
			return errors;
		},
		[
			disableValidation,
			model,
			onlyValidateMounted,
			onlyWarnMounted,
			onlyWarnChanged,
			id,
			mountedFields,
			alwaysSubmitFields,
			getNormalizedData,
			alwaysWarnFields,
		],
	);
	const validateField = useCallback(
		async (field: string, value?: unknown) => {
			const values =
				value !== undefined
					? deepAssign({}, valuesRef.current, dotToObject(field, value))
					: undefined;
			const errors = await validateForm("normal", values);
			const warnings = await validateForm("hint", values);
			setErrors(errors);
			setWarnings(warnings);
		},
		[validateForm],
	);
	const setFieldTouchedLite = useCallback(
		(field: string, newTouched = false) => {
			if (touchedRef.current[field] !== newTouched) {
				touchedRef.current = { ...touchedRef.current, [field]: newTouched };
				setTouched(touchedRef.current);
			}
		},
		[],
	);
	const setFieldTouched = useCallback(
		(field: string, newTouched = true, validate = false) => {
			setFieldTouchedLite(field, newTouched);
			if (validate) void validateField(field);
		},
		[setFieldTouchedLite, validateField],
	);
	const getFieldValue = useCallback((field: string): unknown => {
		return getValueByDot(field, valuesRef.current);
	}, []);
	const getFieldValues = useCallback((): Record<string, unknown> => {
		return valuesRef.current;
	}, []);

	const setFieldValue = useCallback(
		(
			field: string,
			value: unknown,
			validate = true,
			triggerOnChange = false, // default false to prevent recursion
		) => {
			if (triggerOnChange) {
				const onChange = model.fields[field as KeyT].onChange;
				if (onChange) {
					value = onChange(value, model, setFieldValue, getFieldValue);
					if (value === undefined && process.env.NODE_ENV === "development") {
						// eslint-disable-next-line no-console
						console.error(
							`[Components-Care] [Form] onChange handler for field '${field}' returned undefined. Missing return?`,
						);
					}
				}
			}
			setFieldTouched(field, true, false);
			valuesRef.current = dotSet(field, valuesRef.current, value);
			setValues(valuesRef.current);
			if (validate) void validateField(field, value);
		},
		[setFieldTouched, validateField, model, getFieldValue],
	);
	const setFieldValueLite = useCallback(
		(field: string, value: unknown) => {
			setFieldTouchedLite(field, true);
			valuesRef.current = dotSet(field, valuesRef.current, value);
			setValues(valuesRef.current);
		},
		[setFieldTouchedLite],
	);
	const resetForm = useCallback(() => {
		if (!serverData || !serverData[0]) return;
		valuesRef.current = deepClone(serverData[0]);
		setValues(valuesRef.current);
		valuesStagedRef.current = deepClone(serverData[0]);
		setValuesStaged(valuesStagedRef.current);
	}, [serverData]);
	const handleBlur = useCallback(
		(evt: React.FocusEvent<HTMLInputElement & HTMLElement>) => {
			const fieldName =
				evt.currentTarget?.name ??
				evt.currentTarget?.getAttribute("data-name") ??
				evt.currentTarget?.id ??
				evt.target?.name ??
				evt.target?.getAttribute("data-name") ??
				evt.target?.id;
			if (!fieldName) {
				// eslint-disable-next-line no-console
				console.error(
					"[Components-Care] [Form] Handling on blur event for element without name. Please set form name via one of these attributes: name, data-name or id",
					evt,
				);
				return;
			}
			setFieldTouched(fieldName);
		},
		[setFieldTouched],
	);

	// init data structs after first load
	useEffect(() => {
		if (isLoading || !serverData || !serverData[0]) return;

		valuesRef.current = deepClone(serverData[0]);
		setValues(valuesRef.current);
		touchedRef.current = getDefaultTouched();
		setTouched(touchedRef.current);

		if (initialRecord && id == null) {
			void Promise.all(
				Object.keys(model.fields)
					.filter((key) => dotInObject(key, initialRecord))
					.map((key) =>
						setFieldValue(key, getValueByDot(key, initialRecord), false),
					),
			);
		}

		valuesStagedRef.current = deepClone(valuesRef.current);
		setValuesStaged(valuesStagedRef.current);
		valuesStagedModifiedRef.current = deepClone(touchedRef.current);
		setValuesStagedModified(valuesStagedModifiedRef.current);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	// update data struct after background fetch
	useEffect(() => {
		if (isLoading || !serverData || !serverData[0]) return;
		const serverRecord = deepClone(serverData[0]);
		const updateUnmodified = (
			data: Record<string, unknown>,
			modifiedValues: Record<string, boolean>,
		): Record<string, unknown> => {
			const newValues = deepClone(data);
			const untouchedFields = Object.entries(modifiedValues)
				.filter(([, modified]) => !modified)
				.map(([field]) => field);
			untouchedFields
				.filter((field) => dotInObject(field, serverRecord))
				.forEach((field) => {
					deepAssign(
						newValues,
						dotToObject(field, getValueByDot(field, serverRecord)),
					);
				});
			return newValues;
		};

		const combineTouched = (
			...touched: Record<string, boolean>[]
		): Record<string, boolean> => {
			const arrays: [string, boolean][] = touched
				.map((t) => Object.entries(t))
				.flat();
			const fieldKeys = arrays.map((arr) => arr[0]);
			const touchedRef = Object.fromEntries(
				fieldKeys.map((field) => [field, false]),
			);
			arrays.forEach(([field, touched]) => {
				if (touched) touchedRef[field] = true;
			});
			return touchedRef;
		};

		valuesRef.current = updateUnmodified(
			valuesRef.current,
			flowEngine
				? combineTouched(valuesStagedModifiedRef.current, touchedRef.current)
				: touched,
		);
		valuesStagedRef.current = updateUnmodified(
			valuesStagedRef.current,
			valuesStagedModifiedRef.current,
		);
		setValues(valuesRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverData]);

	// main form - submit handler
	const submitForm = useCallback(
		async (
			params?: FormSubmitOptions | React.SyntheticEvent,
		): Promise<void> => {
			if (params && "nativeEvent" in params) params = undefined;
			if (!params) params = {} as FormSubmitOptions;

			if (!serverData) throw new Error("serverData is null"); // should never happen
			if (!defaultRecord) throw new Error("default record is null"); // should never happen
			if (
				!getDirty(getFormDirty(valuesRef.current)) &&
				!flowEngine &&
				!params.ignoreDirtyCheck
			)
				return; // when form isn't dirty we don't have to submit unless it's flow engine and nothing has changed yet (to trigger validations)

			if (preSubmit) {
				let cancelSubmit: boolean;
				try {
					cancelSubmit = await preSubmit({
						serverData: (serverData && serverData[0]) ?? valuesRef.current,
						formData: valuesRef.current,
						submitOptions: params,
						deleteOnSubmit: !!deleteOnSubmit,
						setFieldValue,
					});
				} catch (e) {
					if (captureException) captureException(e as Error);
					// eslint-disable-next-line no-console
					console.error(
						"[Components-Care] [FormEngine] Pre-submit handler threw exception",
						e,
					);
					cancelSubmit = true;
				}
				if (cancelSubmit) {
					return;
				}
			}
			setSubmittingForm(true);
			touchedRef.current = setAllTouched(touchedRef.current, true);
			setTouched(touchedRef.current);
			if (deleteOnSubmit) {
				try {
					const id = (valuesRef.current as Record<"id", string | null>).id;
					if (id) {
						setDeleted(true);
						await deleteRecord(id);
					}
					if (onDeleted) onDeleted(id);
				} catch (e) {
					setDeleted(false);
					if (e instanceof Error) {
						setUpdateError(e);
					}
					throw e;
				} finally {
					setSubmittingForm(false);
				}
				return;
			}

			let throwIsWarning = false;
			try {
				const validationHints = await validateForm("hint");
				setWarnings(validationHints);
				const validation = await validateForm("normal");
				setErrors(validation);
				if (!isObjectEmpty(validation)) {
					// noinspection ExceptionCaughtLocallyJS
					throw new ValidationError("error", validation);
				}

				if (
					!isObjectEmpty(validationHints) &&
					!params.ignoreWarnings &&
					!nestedFormName
				) {
					setSubmittingBlocked(true);
					const continueSubmit = await showConfirmDialogBool(pushDialog, {
						title: t("backend-components.form.submit-with-warnings.title"),
						message: (
							<Grid container spacing={2}>
								<Grid size={12}>
									{t("backend-components.form.submit-with-warnings.message")}
								</Grid>
								<Grid size={12}>
									<ul>
										{Object.entries(validationHints).map(([key, value]) => (
											<li key={key}>{value}</li>
										))}
									</ul>
								</Grid>
							</Grid>
						),
						textButtonYes: t(
							"backend-components.form.submit-with-warnings.yes",
						),
						textButtonNo: t("backend-components.form.submit-with-warnings.no"),
					});
					setSubmittingBlocked(false);
					if (!continueSubmit) {
						throwIsWarning = true;
						// noinspection ExceptionCaughtLocallyJS
						throw new ValidationError("warn", validationHints);
					}
				}

				await Promise.all(
					Object.values(preSubmitHandlers.current).map((handler) =>
						handler(id, params),
					),
				);

				if (flowEngine) {
					// flow engine staged submit
					const updateData = getUpdateData(
						valuesRef.current,
						model as unknown as Model<string, PageVisibility, unknown>,
						flowEngineConfig.current.onlySubmitMounted ?? true,
						flowEngineConfig.current.onlySubmitMountedBehaviour ??
							OnlySubmitMountedBehaviour.OMIT,
						alwaysSubmitFields,
						mountedFields,
						defaultRecord[0],
						id,
					);
					const originalStaged = deepClone(valuesStagedRef.current);
					valuesStagedRef.current = deepAssign(
						valuesStagedRef.current,
						updateData,
					);
					setValuesStaged(valuesStagedRef.current);
					valuesStagedModifiedRef.current = Object.fromEntries(
						Object.entries(valuesStagedModifiedRef.current).map(
							([key, modified]) => [
								key,
								modified ||
									getValueByDot(key, originalStaged) !==
										getValueByDot(key, valuesStagedRef.current),
							],
						),
					);
					setValuesStagedModified(valuesStagedModifiedRef.current);
					touchedRef.current = setAllTouched(touchedRef.current, false);
					setTouched(touchedRef.current);
					valuesRef.current = deepClone(valuesStagedRef.current);
					setValues(valuesRef.current);
				}

				if (!flowEngine || params.submitToServer) {
					const submitValues = valuesRef.current;
					const oldValues = serverData[0];

					const result = await updateData(
						getUpdateData(
							flowEngine ? valuesStagedRef.current : valuesRef.current,
							model as unknown as Model<string, PageVisibility, unknown>,
							flowEngine && id === null ? false : (onlySubmitMounted ?? false),
							onlySubmitMountedBehaviour,
							alwaysSubmitFields,
							flowEngine ? valuesStagedModifiedRef.current : mountedFields,
							defaultRecord[0],
							id,
						),
					);

					const newValues = deepClone(result[0]);
					valuesRef.current = newValues;
					valuesStagedRef.current = deepClone(result[0]);

					touchedRef.current = setAllTouched(touchedRef.current, false);
					setTouched(touchedRef.current);
					valuesStagedModifiedRef.current = setAllTouched(
						valuesStagedModifiedRef.current,
						false,
					);
					setValuesStagedModified(valuesStagedModifiedRef.current);

					await Promise.all(
						Object.values(postSubmitHandlers.current).map((handler) =>
							handler((newValues as Record<"id", string>).id, params),
						),
					);

					// re-render after post submit handler, this way we avoid mounting new components before the form is fully saved
					setValues(newValues);
					setValuesStaged(valuesStagedRef.current);

					if (onSubmit) {
						await onSubmit(newValues, submitValues, oldValues);
					}
				}
			} catch (e) {
				// don't use this for validation errors
				if (!throwIsWarning) setUpdateError(e as Error);
				throw e;
			} finally {
				setSubmittingForm(false);
			}
		},
		[
			serverData,
			defaultRecord,
			getDirty,
			getFormDirty,
			flowEngine,
			preSubmit,
			deleteOnSubmit,
			setFieldValue,
			onDeleted,
			deleteRecord,
			validateForm,
			nestedFormName,
			pushDialog,
			t,
			id,
			model,
			alwaysSubmitFields,
			mountedFields,
			updateData,
			onlySubmitMounted,
			onlySubmitMountedBehaviour,
			onSubmit,
		],
	);
	const submitFormRef = useRef<typeof submitForm>(submitForm);
	submitFormRef.current = submitForm;
	const submitFormReferenced: typeof submitForm = useCallback(
		(p1: Parameters<typeof submitForm>[0]) => {
			return submitFormRef.current(p1);
		},
		[],
	);

	const handleSubmit = useCallback(async (evt: FormEvent<HTMLFormElement>) => {
		evt.preventDefault();
		evt.stopPropagation();
		try {
			await submitFormRef.current();
		} catch {
			// ignore, shown to user via ErrorComponent
		}
	}, []);

	// nested forms
	const parentFormContext = useContext(FormContext);
	if (nestedFormName && !parentFormContext)
		throw new Error("Nested form mode wanted, but no parent context found");

	// nested forms - loading
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		const state =
			parentFormContext.getCustomState<FormNestedState>(nestedFormName);
		if (!state) return;
		valuesRef.current = state.values;
		setValues(state.values);
		setErrors(state.errors);
		setWarnings(state.warnings);
		setTouched(state.touched);
		valuesStagedRef.current = state.valuesStaged;
		setValuesStaged(state.valuesStaged);
		valuesStagedModifiedRef.current = state.valuesStagedModified;
		setValuesStagedModified(state.valuesStagedModified);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// nested forms - saving
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		parentFormContext.setCustomState<FormNestedState>(nestedFormName, () => ({
			values,
			errors,
			warnings,
			touched,
			valuesStaged,
			valuesStagedModified,
		}));

		return () => {
			// clear nested state if record was deleted
			if (!deleted) return;
			parentFormContext.setCustomState<FormNestedState>(
				nestedFormName,
				() => undefined,
			);
		};

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		values,
		errors,
		warnings,
		touched,
		parentFormContext?.setCustomState,
		nestedFormName,
		deleted,
	]);

	// nested forms - dirty state
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;

		parentFormContext.setCustomFieldDirty(nestedFormName, dirty);
		return () => {
			if (
				disableNestedSubmit ||
				(parentFormContext.onlySubmitMounted && !disableNestedSubmit)
			) {
				parentFormContext.setCustomFieldDirty(nestedFormName, false);
			}
		};
	}, [dirty, disableNestedSubmit, nestedFormName, parentFormContext]);

	// nested forms - submitting blocker
	useEffect(() => {
		if (!parentFormContext || !nestedFormName || !submittingBlocked) return;

		parentFormContext.addSubmittingBlocker(nestedFormName);
		return () => {
			parentFormContext.removeSubmittingBlocker(nestedFormName);
		};
	}, [nestedFormName, parentFormContext, submittingBlocked]);

	// nested forms - validation and submit hook
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		const validateNestedForm = () => {
			touchedRef.current = setAllTouched(touchedRef.current, true);
			setTouched(touchedRef.current);
			return validateForm("normal");
		};
		const validateNestedFormWarn = () => {
			touchedRef.current = setAllTouched(touchedRef.current, true);
			setTouched(touchedRef.current);
			return validateForm("hint");
		};
		const submitNestedForm = async (id: string, params: FormSubmitOptions) => {
			if (nestedFormPreSubmitHandler) {
				await nestedFormPreSubmitHandler(
					id,
					model as unknown as Model<ModelFieldName, PageVisibility, unknown>,
					getFieldValue,
					setFieldValueLite,
				);
			}
			await submitForm(params);
			parentFormContext.setCustomFieldDirty(nestedFormName, false);
		};

		if (!disableNestedSubmit) {
			parentFormContext.setCustomValidationHandler(
				nestedFormName,
				validateNestedForm,
			);
			parentFormContext.setCustomWarningHandler(
				nestedFormName,
				validateNestedFormWarn,
			);
			parentFormContext.setPostSubmitHandler(nestedFormName, submitNestedForm);
		}
		return () => {
			if (
				parentFormContext.onlyValidateMounted ||
				onlySubmitNestedIfMounted ||
				disableValidation ||
				disableNestedSubmit
			) {
				parentFormContext.removeCustomValidationHandler(nestedFormName);
				parentFormContext.removeCustomWarningHandler(nestedFormName);
			}
			if (
				parentFormContext.onlySubmitMounted ||
				onlySubmitNestedIfMounted ||
				disableNestedSubmit
			)
				parentFormContext.removePostSubmitHandler(nestedFormName);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		parentFormContext?.setCustomValidationHandler,
		parentFormContext?.setCustomWarningHandler,
		parentFormContext?.onlyValidateMounted,
		parentFormContext?.onlySubmitMounted,
		parentFormContext?.setCustomFieldDirty,
		validateForm,
		disableValidation,
		nestedFormPreSubmitHandler,
		submitForm,
		nestedFormName,
		disableNestedSubmit,
		onlySubmitNestedIfMounted,
	]);

	// Debug Helper (for React Devtools)
	const debugDirty = useCallback(
		(onlyDirty?: boolean) => {
			/* eslint-disable no-console */
			if (!serverData) {
				console.log("Can't determine Dirty State, No server data present");
				return;
			}
			if (!defaultRecord) {
				console.log("Can't determine Dirty State, No default data present");
				return;
			}
			// normalize data
			const [localData, remoteData] = getNormalizedData();

			console.log("Form Dirty Flag State:");
			console.log(
				"Form Dirty State (exact):",
				JSON.stringify(localData) !== JSON.stringify(remoteData),
			);
			console.log(
				"Form Dirty State:",
				JSON.stringify(localData) !== JSON.stringify(remoteData),
			);
			console.log("Custom Dirty State:", customDirty);
			console.log("Custom Dirty Fields:", customDirtyFields);
			console.log("Custom Dirty Counter:", customDirtyCounter);

			console.log("Server Data:", remoteData);
			console.log("Form Data:", localData);
			console.log("Staged Data:", valuesStagedRef.current);

			Object.keys(model.fields).forEach((key) => {
				const server: unknown = getValueByDot(key, remoteData);
				const form = getValueByDot(key, localData);
				const dirty = JSON.stringify(server) !== JSON.stringify(form);
				if (onlyDirty && !dirty) return;
				console.log(
					"Dirty[",
					key,
					"]: ByRef:",
					server !== form,
					"ByJSON:",
					dirty,
					"Value Server:",
					server,
					"Value Form:",
					form,
				);
			});
			/* eslint-enable no-console */
		},
		[
			serverData,
			defaultRecord,
			getNormalizedData,
			customDirty,
			customDirtyFields,
			customDirtyCounter,
			model.fields,
		],
	);
	useDevKeybinds(
		useMemo(() => ({ "ccform dirty?": () => debugDirty(true) }), [debugDirty]),
	);

	// context and rendering
	const Children = useMemo(() => React.memo(children), [children]);
	const setError = useCallback(
		(error: Error) => {
			setUpdateError(error);
		},
		[setUpdateError],
	);

	const formContextData: FormContextData = useMemo(
		() => ({
			id,
			model: model as unknown as Model<ModelFieldName, PageVisibility, never>,
			errorComponent: ErrorComponent,
			relations: serverData && serverData[1] ? serverData[1] : {},
			setError,
			markFieldMounted,
			setCustomDirtyCounter,
			setCustomFieldDirty,
			dirty,
			getCustomState,
			setCustomState,
			setPreSubmitHandler,
			removePreSubmitHandler,
			setPostSubmitHandler,
			removePostSubmitHandler,
			setCustomValidationHandler,
			removeCustomValidationHandler,
			setCustomWarningHandler,
			removeCustomWarningHandler,
			setCustomReadOnly,
			removeCustomReadOnly,
			onlySubmitMounted: !!onlySubmitMounted,
			onlySubmitMountedBehaviour,
			onlyValidateMounted: !!onlyValidateMounted,
			onlyWarnMounted: !!onlyWarnMounted,
			onlyWarnChanged: !!onlyWarnChanged,
			submitting,
			addBusyReason,
			removeBusyReason,
			addSubmittingBlocker,
			removeSubmittingBlocker,
			submit: submitFormReferenced,
			deleteOnSubmit: !!deleteOnSubmit,
			values,
			initialValues: initialValues ?? {},
			touched,
			errors,
			warnings,
			setFieldValue,
			setFieldValueLite,
			setFieldTouchedLite,
			getFieldValue,
			getFieldValues,
			handleBlur,
			setFieldTouched,
			resetForm,
			refetchForm: refetch,
			validateForm,
			parentFormContext: nestedFormName ? parentFormContext : null,
			customProps,
			readOnly: readOnly,
			readOnlyReason: readOnlyReasons[0],
			readOnlyReasons: readOnlyReasons,
			flowEngine: !!flowEngine,
			flowEngineConfig,
		}),
		[
			id,
			model,
			ErrorComponent,
			serverData,
			setError,
			markFieldMounted,
			setCustomFieldDirty,
			dirty,
			getCustomState,
			setCustomState,
			setPreSubmitHandler,
			removePreSubmitHandler,
			setPostSubmitHandler,
			removePostSubmitHandler,
			setCustomValidationHandler,
			removeCustomValidationHandler,
			setCustomWarningHandler,
			removeCustomWarningHandler,
			setCustomReadOnly,
			removeCustomReadOnly,
			onlySubmitMounted,
			onlySubmitMountedBehaviour,
			onlyValidateMounted,
			onlyWarnMounted,
			onlyWarnChanged,
			submitting,
			addBusyReason,
			removeBusyReason,
			addSubmittingBlocker,
			removeSubmittingBlocker,
			submitFormReferenced,
			deleteOnSubmit,
			values,
			initialValues,
			touched,
			errors,
			warnings,
			setFieldValue,
			setFieldValueLite,
			setFieldTouchedLite,
			getFieldValue,
			getFieldValues,
			handleBlur,
			setFieldTouched,
			resetForm,
			refetch,
			validateForm,
			nestedFormName,
			parentFormContext,
			customProps,
			readOnly,
			readOnlyReasons,
			flowEngine,
		],
	);

	const formContextDataLite: FormContextDataLite = useMemo(
		() => ({
			id,
			model: model as unknown as Model<ModelFieldName, PageVisibility, never>,
			customProps,
			errorComponent: ErrorComponent,
			onlySubmitMounted: !!onlySubmitMounted,
			onlyValidateMounted: !!onlyValidateMounted,
			onlyWarnMounted: !!onlyWarnMounted,
			onlyWarnChanged: !!onlyWarnChanged,
			readOnly: readOnly,
			readOnlyReason: readOnlyReasons[0],
			readOnlyReasons: readOnlyReasons,
			initialValues: initialValues ?? {},
			getFieldValue,
			getFieldValues,
			setFieldValueLite,
			setFieldTouchedLite,
			setCustomReadOnly,
			removeCustomReadOnly,
			flowEngine: !!flowEngine,
			submit: submitFormReferenced,
			submitting,
			dirty,
			flowEngineConfig,
		}),
		[
			id,
			model,
			customProps,
			ErrorComponent,
			onlySubmitMounted,
			onlyValidateMounted,
			onlyWarnMounted,
			onlyWarnChanged,
			setCustomReadOnly,
			removeCustomReadOnly,
			readOnly,
			readOnlyReasons,
			initialValues,
			getFieldValue,
			getFieldValues,
			setFieldValueLite,
			setFieldTouchedLite,
			flowEngine,
			submitFormReferenced,
			submitting,
			dirty,
		],
	);

	if (error) {
		if (ErrorRenderer)
			return <ErrorRenderer customProps={customProps} error={error} />;
		return <Typography color={"error"}>{error.message}</Typography>;
	}
	if (isLoading || isDefaultRecordLoading || isObjectEmpty(values)) {
		return <Loader />;
	}

	const displayError: Error | ValidationError | null =
		defaultRecordError || updateError;

	if (!serverData || serverData.length !== 2 || isObjectEmpty(serverData[0])) {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] [FormEngine] Data is faulty",
			serverData ? JSON.stringify(serverData, undefined, 4) : null,
		);
		throw new Error("Data is not present, this should never happen");
	}

	const innerForm = () => (
		<>
			{displayError && !nestedFormName && (
				<ErrorComponent error={displayError} />
			)}
			{isLoading ? (
				<div style={loaderContainerStyles}>
					<Loader />
				</div>
			) : (
				<Children
					isSubmitting={submitting}
					values={props.renderConditionally ? values : undefined}
					submit={submitForm}
					reset={resetForm}
					dirty={dirty}
					id={id}
					customProps={customProps}
					disableRouting={!!props.disableRouting}
				/>
			)}
		</>
	);

	return (
		<FormContextLite.Provider value={formContextDataLite}>
			<FormContext.Provider value={formContextData}>
				{!parentFormContext && !renderFormAsDiv ? (
					<StyledForm onSubmit={handleSubmit} className={formClass}>
						{innerForm()}
					</StyledForm>
				) : (
					<StyledFormDiv className={formClass}>{innerForm()}</StyledFormDiv>
				)}
			</FormContext.Provider>
		</FormContextLite.Provider>
	);
};

export default React.memo(Form) as typeof Form;
