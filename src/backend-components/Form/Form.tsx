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
	deepAssign,
	deepClone,
	dotInObject,
	dotSet,
	dotsToObject,
	dotToObject,
	getValueByDot,
	isObjectEmpty,
} from "../../utils";
import { Grid } from "@material-ui/core";
import { getVisibility } from "../../backend-integration/Model/Visibility";
import { QueryObserverBaseResult } from "react-query/types/core/types";
import { showConfirmDialogBool } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { useDialogContext } from "../../framework";
import deepSort from "../../utils/deepSort";

// optional import
let captureException: ((e: Error) => void) | null = null;
import("@sentry/react")
	.then((Sentry) => (captureException = Sentry.captureException))
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	.catch(() => {}); // ignore

export type ValidationError = Record<string, string>;
/**
 * Pre submit handler for additional validations
 * Throw to cancel submit and display error.
 * Thrown error may be a ValidationError or an normal Error (other error)
 */
export type CustomValidationHandler = () =>
	| Promise<ValidationError>
	| ValidationError;
/**
 * Pre submit handler to perform final changes (bypassing validation)
 */
export type PreSubmitHandler = (
	id: string | null,
	submitOptions: FormSubmitOptions
) => Promise<void> | unknown;
/**
 * Post submit handler to submit additional data for the submitted record
 */
export type PostSubmitHandler = (
	id: string,
	submitOptions: FormSubmitOptions
) => Promise<void> | unknown;

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
	CustomPropsT
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
	onSubmit?: (
		dataFromServer: Record<string, unknown>,
		submittedData: Record<string, unknown>,
		previousData: Record<string, unknown>
	) => Promise<void> | void;
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
	 */
	onlySubmitMounted?: boolean;
	/**
	 * Behaviour for "only submit mounted"
	 * @default OnlySubmitMountedBehaviour.OMIT
	 */
	onlySubmitMountedBehaviour?: OnlySubmitMountedBehaviour;
	/**
	 * Only validate mounted fields
	 */
	onlyValidateMounted?: boolean;
	/**
	 * Only perform warning validations for mounted fields
	 */
	onlyWarnMounted?: boolean;
	/**
	 * Is the form read-only?
	 */
	readOnly?: boolean;
	/**
	 * Optional read-only reason
	 */
	readOnlyReason?: string | null;
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
	nestedFormPreSubmitHandler?: (
		id: string,
		model: Model<ModelFieldName, PageVisibility, unknown>
	) => Promise<void> | unknown;
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
	 * Sets the pre submit handler (for custom fields)
	 * @param field custom field name (must not be in model)
	 */
	setCustomValidationHandler: (
		field: string,
		handler: CustomValidationHandler
	) => void;
	/**
	 * Removes a pre submit handler (for custom fields)
	 * @param field custom field name (must not be in model)
	 */
	removeCustomValidationHandler: (field: string) => void;
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
		data: Dispatch<SetStateAction<T | undefined>>
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
	 * @see FormProps.readOnly
	 */
	readOnly: boolean;
	/**
	 * @see FormProps.readOnlyReason
	 */
	readOnlyReason: string | null | undefined;
	/**
	 * Is the form being submitted
	 */
	submitting: boolean;
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
		triggerOnChange?: boolean
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
		validate?: boolean
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
		mode?: "normal" | "hint"
	) => Promise<ValidationError> | ValidationError;
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
	| "onlySubmitMounted"
	| "onlyValidateMounted"
	| "onlyWarnMounted"
	| "readOnly"
	| "readOnlyReason"
	| "errorComponent"
	| "getFieldValue"
	| "setFieldValueLite"
	| "setFieldTouchedLite"
>;
export const FormContextLite = React.createContext<FormContextDataLite | null>(
	null
);
export const useFormContextLite = (): FormContextDataLite => {
	const ctx = useContext(FormContextLite);
	if (!ctx)
		throw new Error("Form Context (Lite) not set. Not using form engine?");
	return ctx;
};

export interface FormNestedState {
	values: Record<string, unknown>;
	touched: Record<string, boolean>;
	errors: Record<string, string | null>;
	warnings: Record<string, string | null>;
}

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
	mountedFields: Record<string, boolean>,
	defaultRecord: Record<string, unknown>,
	id: string | null
) => {
	const isMounted = (key: string): boolean =>
		key === "id" ||
		mountedFields[key] ||
		getVisibility(model.fields[key].visibility[id ? "edit" : "create"], values)
			.hidden;

	return !onlySubmitMounted
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
							`Invalid onlySubmitMountedBehaviour ${behaviour as string}`
						);
					}
				}
				return dotsToObject(result);
		  })();
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
		mountedFields,
		defaultRecord,
	} = config;

	data = getUpdateData(
		(data as unknown) as Record<string, unknown>,
		model,
		onlySubmitMounted,
		onlySubmitMountedBehaviour,
		mountedFields,
		defaultRecord,
		((data as unknown) as Record<"id", string | null>).id
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

const Form = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT,
	CustomPropsT
>(
	props: FormProps<KeyT, VisibilityT, CustomT, CustomPropsT>
) => {
	const {
		model,
		id,
		children,
		onSubmit,
		customProps,
		onlyValidateMounted,
		onlyWarnMounted,
		onlySubmitMounted,
		readOnly,
		readOnlyReason,
		disableValidation,
		nestedFormName,
		disableNestedSubmit,
		nestedFormPreSubmitHandler,
		deleteOnSubmit,
		onDeleted,
		initialRecord,
		onlySubmitNestedIfMounted,
		formClass,
		preSubmit,
		dirtyIgnoreFields,
	} = props;
	const onlySubmitMountedBehaviour =
		props.onlySubmitMountedBehaviour ?? OnlySubmitMountedBehaviour.OMIT;
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
		[]
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
		[]
	);
	const removeCustomValidationHandler = useCallback((field: string) => {
		delete customValidationHandlers.current[field];
	}, []);

	// custom fields - post submit handlers
	const postSubmitHandlers = useRef<Record<string, PostSubmitHandler>>({});
	const setPostSubmitHandler = useCallback(
		(field: string, handler: PostSubmitHandler) => {
			postSubmitHandlers.current[field] = handler;
		},
		[]
	);
	const removePostSubmitHandler = useCallback((field: string) => {
		delete postSubmitHandlers.current[field];
	}, []);

	// custom fields - state
	const customFieldState = useRef<Record<string, unknown>>({});
	const getCustomState = useCallback(
		<T,>(field: string): T => customFieldState.current[field] as T,
		[]
	);
	const setCustomState = useCallback(
		<T,>(field: string, value: Dispatch<SetStateAction<T | undefined>>) => {
			customFieldState.current[field] =
				typeof value === "function"
					? value(customFieldState.current[field] as T | undefined)
					: value;
		},
		[]
	);

	// main form handling
	const [deleted, setDeleted] = useState(false);
	useEffect(() => {
		// clear deleted state upon id change
		setDeleted(false);
	}, [id]);
	const { isLoading, error, data: serverData, refetch } = useModelGet(
		model,
		deleted ? null : id || null
	);
	const { mutateAsync: updateData } = useModelMutation(model);
	const { mutateAsync: deleteRecord } = useModelDelete(model);
	const {
		isLoading: isDefaultRecordLoading,
		data: defaultRecord,
		error: defaultRecordError,
	} = useModelGet(model, null);

	const [updateError, setUpdateError] = useState<
		Error | ValidationError | null
	>(null);
	const valuesRef = useRef<Record<string, unknown>>({});
	const [values, setValues] = useState<Record<string, unknown>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [errors, setErrors] = useState<Record<string, string | null>>({});
	const [warnings, setWarnings] = useState<Record<string, string | null>>({});
	const [submitting, setSubmitting] = useState(false);

	// main form handling - validation disable toggle
	useEffect(() => {
		if (!disableValidation) return;
		setErrors({});
		setWarnings({});
	}, [disableValidation]);

	// main form handling - mounted state tracking
	const [mountedFields, setMountedFields] = useState(() =>
		Object.fromEntries(Object.keys(model.fields).map((field) => [field, false]))
	);
	const markFieldMounted = useCallback((field: string, mounted: boolean) => {
		setMountedFields((prev) => ({ ...prev, [field as KeyT]: mounted }));
	}, []);

	// main form handling - dirty state
	const dirty =
		useMemo(
			() =>
				serverData && defaultRecord
					? JSON.stringify(
							normalizeValues(values, {
								ignoreFields: dirtyIgnoreFields,
								model: (model as unknown) as Model<
									string,
									PageVisibility,
									unknown
								>,
								defaultRecord: defaultRecord[0],
								onlySubmitMountedBehaviour,
								onlySubmitMounted: onlySubmitMounted ?? false,
								mountedFields,
							})
					  ) !==
					  JSON.stringify(
							normalizeValues(serverData[0], {
								ignoreFields: dirtyIgnoreFields,
								model: (model as unknown) as Model<
									string,
									PageVisibility,
									unknown
								>,
								defaultRecord: defaultRecord[0],
								onlySubmitMountedBehaviour,
								onlySubmitMounted: onlySubmitMounted ?? false,
								mountedFields,
							})
					  )
					: false,
			[
				serverData,
				defaultRecord,
				values,
				dirtyIgnoreFields,
				model,
				onlySubmitMountedBehaviour,
				onlySubmitMounted,
				mountedFields,
			]
		) ||
		customDirty ||
		!!(id && !deleted && deleteOnSubmit);

	// main form handling - dispatch
	const validateForm = useCallback(
		async (
			mode: "normal" | "hint" = "normal",
			values?: Record<string, unknown>
		) => {
			if (disableValidation) return {};

			const errors = await model.validate(
				values ?? valuesRef.current,
				id ? "edit" : "create",
				onlyValidateMounted || (mode === "hint" && onlyWarnMounted)
					? (Object.keys(mountedFields).filter(
							(field) => mountedFields[field as KeyT]
					  ) as KeyT[])
					: undefined,
				mode
			);
			await Promise.all(
				Object.entries(customValidationHandlers.current).map(
					async ([name, handler]) => {
						const customErrors = await handler();
						for (const key in customErrors) {
							if (!Object.prototype.hasOwnProperty.call(customErrors, key))
								continue;
							errors[name + "_" + key] = customErrors[key];
						}
					}
				)
			);
			return errors;
		},
		[
			disableValidation,
			model,
			id,
			onlyValidateMounted,
			onlyWarnMounted,
			mountedFields,
		]
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
		[validateForm]
	);
	const setFieldTouchedLite = useCallback(
		(field: string, newTouched = false) => {
			setTouched((prev) =>
				prev[field] === newTouched
					? prev
					: { ...prev, [field]: newTouched as boolean }
			);
		},
		[]
	);
	const setFieldTouched = useCallback(
		(field: string, newTouched = true, validate = false) => {
			setFieldTouchedLite(field, newTouched);
			if (validate) void validateField(field);
		},
		[setFieldTouchedLite, validateField]
	);
	const getFieldValue = useCallback((field: string): unknown => {
		return getValueByDot(field, valuesRef.current);
	}, []);
	const setFieldValue = useCallback(
		(
			field: string,
			value: unknown,
			validate = true,
			triggerOnChange = false // default false to prevent recursion
		) => {
			if (triggerOnChange) {
				const onChange = model.fields[field as KeyT].onChange;
				if (onChange) {
					value = onChange(value, model, setFieldValue, getFieldValue);
					if (value === undefined && process.env.NODE_ENV === "development") {
						// eslint-disable-next-line no-console
						console.error(
							`[Components-Care] [Form] onChange handler for field '${field}' returned undefined. Missing return?`
						);
					}
				}
			}
			setFieldTouched(field, true, false);
			valuesRef.current = dotSet(field, valuesRef.current, value);
			setValues(valuesRef.current);
			if (validate) void validateField(field, value);
		},
		[setFieldTouched, validateField, model, getFieldValue]
	);
	const setFieldValueLite = useCallback(
		(field: string, value: unknown) => {
			setFieldTouchedLite(field, true);
			valuesRef.current = dotSet(field, valuesRef.current, value);
			setValues(valuesRef.current);
		},
		[setFieldTouchedLite]
	);
	const resetForm = useCallback(() => {
		if (!serverData || !serverData[0]) return;
		valuesRef.current = deepClone(serverData[0]);
		setValues(valuesRef.current);
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
					evt
				);
				return;
			}
			setFieldTouched(fieldName);
		},
		[setFieldTouched]
	);

	// init data structs after first load
	useEffect(() => {
		if (isLoading || !serverData || !serverData[0]) return;

		valuesRef.current = deepClone(serverData[0]);
		setValues(valuesRef.current);
		setTouched(
			Object.fromEntries(Object.keys(model.fields).map((key) => [key, false]))
		);

		if (initialRecord && id == null) {
			void Promise.all(
				Object.entries(initialRecord).map(([key, value]) =>
					setFieldValue(key, value, false)
				)
			);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	// update data struct after background fetch
	useEffect(() => {
		if (isLoading || !serverData || !serverData[0]) return;

		const newValues = deepClone(valuesRef.current);
		const serverRecord = deepClone(serverData[0]);

		const untouchedFields = Object.entries(touched)
			.filter(([, touched]) => !touched)
			.map(([field]) => field);
		untouchedFields
			.filter((field) => dotInObject(field, serverRecord))
			.forEach((field) => {
				deepAssign(
					newValues,
					dotToObject(field, getValueByDot(field, serverRecord))
				);
			});

		valuesRef.current = newValues;
		setValues(newValues);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverData]);

	// main form - submit handler
	const submitForm = useCallback(
		async (
			params?: FormSubmitOptions | React.SyntheticEvent
		): Promise<void> => {
			if (!serverData) throw new Error("serverData is null"); // should never happen
			if (!defaultRecord) throw new Error("default record is null"); // should never happen

			if (params && "nativeEvent" in params) params = undefined;
			if (!params) params = {} as FormSubmitOptions;

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
						e
					);
					cancelSubmit = true;
				}
				if (cancelSubmit) {
					return;
				}
			}
			setSubmitting(true);
			setTouched((prev) =>
				Object.fromEntries(Object.keys(prev).map((field) => [field, true]))
			);
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
					setSubmitting(false);
				}
				return;
			}
			try {
				const validationHints = await validateForm("hint");
				setWarnings(validationHints);
				const validation = await validateForm("normal");
				setErrors(validation);
				if (!isObjectEmpty(validation)) {
					// noinspection ExceptionCaughtLocallyJS
					throw validation;
				}

				if (!isObjectEmpty(validationHints) && !params.ignoreWarnings) {
					setSubmitting(false);
					const continueSubmit = await showConfirmDialogBool(pushDialog, {
						title: t("backend-components.form.submit-with-warnings.title"),
						message: (
							<Grid container spacing={2}>
								<Grid item xs={12}>
									{t("backend-components.form.submit-with-warnings.message")}
								</Grid>
								<Grid item xs={12}>
									<ul>
										{Object.entries(validationHints).map(([key, value]) => (
											<li key={key}>{value}</li>
										))}
									</ul>
								</Grid>
							</Grid>
						),
						textButtonYes: t(
							"backend-components.form.submit-with-warnings.yes"
						),
						textButtonNo: t("backend-components.form.submit-with-warnings.no"),
					});
					if (!continueSubmit) {
						return;
					}
					setSubmitting(true);
				}

				await Promise.all(
					Object.values(preSubmitHandlers.current).map((handler) =>
						handler(id, params as FormSubmitOptions)
					)
				);

				const submitValues = valuesRef.current;
				const oldValues = serverData[0];

				const result = await updateData(
					getUpdateData(
						valuesRef.current,
						(model as unknown) as Model<string, PageVisibility, unknown>,
						onlySubmitMounted ?? false,
						onlySubmitMountedBehaviour,
						mountedFields,
						defaultRecord[0],
						id
					)
				);

				const newValues = deepClone(result[0]);
				valuesRef.current = newValues;

				setTouched((prev) =>
					Object.fromEntries(Object.keys(prev).map((field) => [field, false]))
				);

				await Promise.all(
					Object.values(postSubmitHandlers.current).map((handler) =>
						handler(
							(newValues as Record<"id", string>).id,
							params as FormSubmitOptions
						)
					)
				);

				// re-render after post submit handler, this way we avoid mounting new components before the form is fully saved
				setValues(newValues);

				if (onSubmit) {
					await onSubmit(newValues, submitValues, oldValues);
				}
			} catch (e) {
				// don't use this for validation errors
				setUpdateError(e as Error);
				throw e;
			} finally {
				setSubmitting(false);
			}
		},
		[
			serverData,
			defaultRecord,
			preSubmit,
			deleteOnSubmit,
			setFieldValue,
			onDeleted,
			deleteRecord,
			validateForm,
			updateData,
			model,
			onlySubmitMounted,
			onlySubmitMountedBehaviour,
			mountedFields,
			id,
			onSubmit,
			pushDialog,
			t,
		]
	);
	const handleSubmit = useCallback(
		(evt: FormEvent<HTMLFormElement>) => {
			evt.preventDefault();
			evt.stopPropagation();
			void submitForm();
		},
		[submitForm]
	);

	// nested forms
	const parentFormContext = useContext(FormContext);
	if (nestedFormName && !parentFormContext)
		throw new Error("Nested form mode wanted, but no parent context found");

	// nested forms - loading
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		const state = parentFormContext.getCustomState<FormNestedState>(
			nestedFormName
		);
		if (!state) return;
		valuesRef.current = state.values;
		setValues(state.values);
		setErrors(state.errors);
		setWarnings(state.warnings);
		setTouched(state.touched);
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
		}));

		return () => {
			// clear nested state if record was deleted
			if (!deleted) return;
			parentFormContext.setCustomState<FormNestedState>(
				nestedFormName,
				() => undefined
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
			if (parentFormContext.onlySubmitMounted && !disableNestedSubmit) {
				parentFormContext.setCustomFieldDirty(nestedFormName, false);
			}
		};
	}, [dirty, disableNestedSubmit, nestedFormName, parentFormContext]);

	// nested forms - validation and submit hook
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		const validateNestedForm = () => {
			setTouched((prev) =>
				Object.fromEntries(Object.keys(prev).map((field) => [field, true]))
			);
			return validateForm();
		};
		const submitNestedForm = async (id: string, params: FormSubmitOptions) => {
			if (nestedFormPreSubmitHandler) {
				await nestedFormPreSubmitHandler(
					id,
					(model as unknown) as Model<ModelFieldName, PageVisibility, unknown>
				);
			}
			await submitForm(params);
			parentFormContext.setCustomFieldDirty(nestedFormName, false);
		};

		if (!disableNestedSubmit) {
			parentFormContext.setCustomValidationHandler(
				nestedFormName,
				validateNestedForm
			);
			parentFormContext.setPostSubmitHandler(nestedFormName, submitNestedForm);
		}
		return () => {
			if (
				parentFormContext.onlyValidateMounted ||
				onlySubmitNestedIfMounted ||
				disableValidation ||
				disableNestedSubmit
			)
				parentFormContext.removeCustomValidationHandler(nestedFormName);
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
	useCallback(
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
			const localData = normalizeValues(values, {
				ignoreFields: dirtyIgnoreFields,
				model: (model as unknown) as Model<string, PageVisibility, unknown>,
				defaultRecord: defaultRecord[0],
				onlySubmitMountedBehaviour,
				onlySubmitMounted: onlySubmitMounted ?? false,
				mountedFields,
			});
			const remoteData = normalizeValues(serverData[0], {
				ignoreFields: dirtyIgnoreFields,
				model: (model as unknown) as Model<string, PageVisibility, unknown>,
				defaultRecord: defaultRecord[0],
				onlySubmitMountedBehaviour,
				onlySubmitMounted: onlySubmitMounted ?? false,
				mountedFields,
			});

			console.log("Form Dirty Flag State:");
			console.log(
				"Form Dirty State (exact):",
				JSON.stringify(localData) !== JSON.stringify(remoteData)
			);
			console.log(
				"Form Dirty State:",
				JSON.stringify(localData) !== JSON.stringify(remoteData)
			);
			console.log("Custom Dirty State:", customDirty);
			console.log("Custom Dirty Fields:", customDirtyFields);
			console.log("Custom Dirty Counter:", customDirtyCounter);

			console.log("Server Data:", remoteData);
			console.log("Form Data:", localData);

			Object.keys(localData).forEach((key) => {
				const server: unknown = remoteData[key as KeyT];
				const form = localData[key];
				const dirty = JSON.stringify(server) !== JSON.stringify(form);
				if (onlyDirty && !dirty) return;
				console.log(
					"Dirty[",
					key,
					"]: ByRef:",
					server !== form,
					"ByJSON:",
					dirty
				);
			});
			/* eslint-enable no-console */
		},
		[
			serverData,
			defaultRecord,
			values,
			dirtyIgnoreFields,
			model,
			onlySubmitMountedBehaviour,
			onlySubmitMounted,
			mountedFields,
			customDirty,
			customDirtyFields,
			customDirtyCounter,
		]
	);

	// context and rendering
	const Children = useMemo(() => React.memo(children), [children]);
	const setError = useCallback(
		(error: Error) => {
			setUpdateError(error);
		},
		[setUpdateError]
	);

	const formContextData: FormContextData = useMemo(
		() => ({
			id,
			model: (model as unknown) as Model<ModelFieldName, PageVisibility, never>,
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
			onlySubmitMounted: !!onlySubmitMounted,
			onlySubmitMountedBehaviour,
			onlyValidateMounted: !!onlyValidateMounted,
			onlyWarnMounted: !!onlyWarnMounted,
			submitting,
			submit: submitForm,
			deleteOnSubmit: !!deleteOnSubmit,
			values,
			initialValues: serverData ? serverData[0] : {},
			touched,
			errors,
			warnings,
			setFieldValue,
			setFieldValueLite,
			setFieldTouchedLite,
			getFieldValue,
			handleBlur,
			setFieldTouched,
			resetForm,
			refetchForm: refetch,
			validateForm,
			parentFormContext: nestedFormName ? parentFormContext : null,
			customProps,
			readOnly: !!readOnly,
			readOnlyReason: readOnlyReason,
		}),
		[
			id,
			model,
			ErrorComponent,
			serverData,
			setError,
			markFieldMounted,
			dirty,
			getCustomState,
			setCustomState,
			setCustomFieldDirty,
			setPreSubmitHandler,
			removePreSubmitHandler,
			setPostSubmitHandler,
			removePostSubmitHandler,
			setCustomValidationHandler,
			removeCustomValidationHandler,
			onlySubmitMounted,
			onlySubmitMountedBehaviour,
			onlyValidateMounted,
			onlyWarnMounted,
			deleteOnSubmit,
			submitting,
			submitForm,
			values,
			touched,
			errors,
			warnings,
			setFieldValue,
			setFieldValueLite,
			setFieldTouchedLite,
			getFieldValue,
			handleBlur,
			setFieldTouched,
			resetForm,
			refetch,
			validateForm,
			parentFormContext,
			nestedFormName,
			customProps,
			readOnly,
			readOnlyReason,
		]
	);

	const formContextDataLite: FormContextDataLite = useMemo(
		() => ({
			id,
			model: (model as unknown) as Model<ModelFieldName, PageVisibility, never>,
			errorComponent: ErrorComponent,
			onlySubmitMounted: !!onlySubmitMounted,
			onlyValidateMounted: !!onlyValidateMounted,
			onlyWarnMounted: !!onlyWarnMounted,
			readOnly: !!readOnly,
			readOnlyReason: readOnlyReason,
			getFieldValue,
			setFieldValueLite,
			setFieldTouchedLite,
		}),
		[
			id,
			model,
			ErrorComponent,
			onlySubmitMounted,
			onlyValidateMounted,
			onlyWarnMounted,
			readOnly,
			readOnlyReason,
			getFieldValue,
			setFieldValueLite,
			setFieldTouchedLite,
		]
	);

	if (isLoading || isDefaultRecordLoading || isObjectEmpty(values)) {
		return <Loader />;
	}

	const displayError: Error | ValidationError | null =
		error || defaultRecordError || updateError;

	if (!serverData || serverData.length !== 2 || isObjectEmpty(serverData[0])) {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] [FormEngine] Data is faulty",
			serverData ? JSON.stringify(serverData, undefined, 4) : null
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
				{!parentFormContext ? (
					<form onSubmit={handleSubmit} className={formClass}>
						{innerForm()}
					</form>
				) : (
					<div className={formClass}>{innerForm()}</div>
				)}
			</FormContext.Provider>
		</FormContextLite.Provider>
	);
};

export default React.memo(Form) as typeof Form;
