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
} from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { isObjectEmpty } from "../../utils";

/**
 * Pre submit handler for additional validations
 * Throw to cancel submit and display error.
 * Thrown error may be a Record<string, string> (validation error) or an normal Error (other error)
 */
export type CustomValidationHandler = () => Record<string, string>;
/**
 * Post submit handler to submit additional data for the submitted record
 */
export type PostSubmitHandler = (id: string) => Promise<void> | unknown;

export interface ErrorComponentProps {
	/**
	 * The last error that happened
	 */
	error: Error;
}

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
	 * The values of the form, can be used for conditional rendering.
	 * Only present if renderConditionally is set to true in FormProps
	 */
	values?: Record<KeyT, unknown>;
	/**
	 * Function to trigger form submit
	 */
	submit: () => Promise<void>;
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
	 * Called upon successful submit
	 * Contains data from server response
	 * @param dataFromServer The data from the server response (model data)
	 */
	onSubmit?: (dataFromServer: Record<KeyT, unknown>) => Promise<void> | void;
	/**
	 * Custom props supplied by the parent for the children
	 */
	customProps: CustomPropsT;
	/**
	 * Only submit mounted fields
	 */
	onlySubmitMounted?: boolean;
	/**
	 * Only validate mounted fields
	 */
	onlyValidateMounted?: boolean;
	/**
	 * Is the form read-only?
	 */
	readOnly?: boolean;
	/**
	 * Nested form name
	 * Enables nested form mode if set to non-empty string
	 * Form is submitted with main form submit. Does not support multiple layers of nesting
	 */
	nestedFormName?: string;
	/**
	 * Submit preparation handler
	 * Called after parent form submit, before this form submit
	 * @param id The ID of the parent form (after submit)
	 */
	nestedFormPreSubmitHandler?: (id: string) => Promise<void> | unknown;
}

export interface FormContextData {
	/**
	 * The data model of this form
	 */
	model: Model<ModelFieldName, PageVisibility, never>;
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
	 */
	setCustomDirtyCounter: Dispatch<SetStateAction<number>>;
	/**
	 * Is the form dirty?
	 */
	dirty: boolean;
	/**
	 * @see FormProps.onlySubmitMounted
	 */
	onlySubmitMounted: boolean;
	/**
	 * @see FormProps.onlyValidateMounted
	 */
	onlyValidateMounted: boolean;
	/**
	 * @see FormProps.readOnly
	 */
	readOnly: boolean;
	/**
	 * Is the form being submitted
	 */
	submitting: boolean;
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
	 * The current field touched state
	 */
	touched: Record<string, boolean>;
	/**
	 * Sets a field value
	 */
	setFieldValue: (field: string, value: unknown, validate?: boolean) => void;
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
	 * Resets the form to server values
	 */
	resetForm: () => void;
	/**
	 * Validates the form and returns a list of validation errors
	 * If the returned object is empty no validation errors occurred.
	 */
	validateForm: () => Record<string, string>;
	/**
	 * Parent form context (if present and FormProps.nestedFormName is set)
	 */
	parentFormContext: FormContextData | null;
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
	"onlySubmitMounted" | "onlyValidateMounted" | "readOnly"
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
}

const loaderContainerStyles: CSSProperties = {
	height: 320,
	width: 320,
	margin: "auto",
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
		onlySubmitMounted,
		readOnly,
		nestedFormName,
		nestedFormPreSubmitHandler,
	} = props;
	const ErrorComponent = props.errorComponent;

	// custom fields - dirty state
	const [customDirtyCounter, setCustomDirtyCounter] = useState(0);
	const customDirty = customDirtyCounter > 0;

	// custom fields - pre submit handlers
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
		<T extends unknown>(field: string): T =>
			customFieldState.current[field] as T,
		[]
	);
	const setCustomState = useCallback(
		<T extends unknown>(
			field: string,
			value: Dispatch<SetStateAction<T | undefined>>
		) => {
			customFieldState.current[field] =
				typeof value === "function"
					? value(customFieldState.current[field] as T | undefined)
					: value;
		},
		[]
	);

	// main form handling
	const { isLoading, error, data: serverData } = model.get(id || null);
	const { mutateAsync: updateData } = model.createOrUpdate();

	const [updateError, setUpdateError] = useState<Error | null>(null);
	const valuesRef = useRef<Record<string, unknown>>({});
	const [values, setValues] = useState<Record<string, unknown>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const dirty =
		useMemo(
			() =>
				serverData
					? JSON.stringify(values) !== JSON.stringify(serverData[0])
					: false,
			[values, serverData]
		) || customDirty;
	const [errors, setErrors] = useState<Record<string, string | null>>({});
	const [submitting, setSubmitting] = useState(false);

	// main form handling - mounted state tracking
	const [mountedFields, setMountedFields] = useState(() =>
		Object.fromEntries(Object.keys(model.fields).map((field) => [field, false]))
	);
	const markFieldMounted = useCallback((field: string, mounted: boolean) => {
		setMountedFields((prev) => ({ ...prev, [field as KeyT]: mounted }));
	}, []);

	// main form handling - dispatch
	const validateForm = useCallback(
		(values?: Record<string, unknown>) => {
			const errors = model.validate(
				values ?? valuesRef.current,
				id ? "edit" : "create",
				onlyValidateMounted
					? (Object.keys(mountedFields).filter(
							(field) => mountedFields[field as KeyT]
					  ) as KeyT[])
					: undefined
			);
			Object.entries(customValidationHandlers.current).forEach(
				([name, handler]) => {
					const customErrors = handler();
					for (const key in customErrors) {
						if (!Object.prototype.hasOwnProperty.call(customErrors, key))
							continue;
						errors[name + "_" + key] = customErrors[key];
					}
				}
			);
			return errors;
		},
		[model, id, onlyValidateMounted, mountedFields]
	);
	const validateField = useCallback(
		(field: string, value?: unknown) => {
			const errors = validateForm(
				value !== undefined
					? { ...valuesRef.current, [field]: value }
					: undefined
			);
			setErrors(errors);
		},
		[validateForm]
	);
	const setFieldTouched = useCallback(
		(field: string, newTouched = true, validate = false) => {
			setTouched((prev) =>
				prev[field] === newTouched
					? prev
					: { ...prev, [field]: newTouched as boolean }
			);
			if (validate) validateField(field);
		},
		[validateField]
	);
	const setFieldValue = useCallback(
		(field: string, value: unknown, validate = true) => {
			setFieldTouched(field, true, false);
			valuesRef.current[field] = value;
			setValues((prev) => ({ ...prev, [field]: value }));
			if (validate) validateField(field, value);
		},
		[validateField, setFieldTouched]
	);
	const resetForm = useCallback(() => {
		if (!serverData || !serverData[0]) return;
		valuesRef.current = { ...serverData[0] };
		setValues(valuesRef.current);
	}, [serverData]);
	const handleBlur = useCallback(
		(evt: React.FocusEvent<HTMLInputElement & HTMLElement>) => {
			const fieldName =
				evt.target.name ??
				evt.target.getAttribute("data-name") ??
				evt.target.id;
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

		valuesRef.current = { ...serverData[0] };
		setValues(valuesRef.current);
		setTouched(
			Object.fromEntries(Object.keys(serverData[0]).map((key) => [key, false]))
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLoading]);

	// update data struct after background fetch
	useEffect(() => {
		if (isLoading || !serverData || !serverData[0]) return;

		const untouchedFields = Object.entries(touched)
			.filter(([, touched]) => !touched)
			.map(([field]) => field);
		untouchedFields
			.filter((field) => field in serverData[0])
			.forEach((field) => {
				valuesRef.current[field] = serverData[0][field as KeyT];
			});
		setValues(valuesRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverData]);

	// main form - submit handler
	const submitForm = useCallback(async (): Promise<void> => {
		setSubmitting(true);
		setTouched((prev) =>
			Object.fromEntries(Object.keys(prev).map((field) => [field, true]))
		);
		try {
			const validation = validateForm();
			setErrors(validation);
			if (!isObjectEmpty(validation)) {
				// noinspection ExceptionCaughtLocallyJS
				throw validation;
			}

			const result = await updateData(
				onlySubmitMounted
					? Object.fromEntries(
							Object.entries(valuesRef.current).filter(
								([key]) => mountedFields[key as KeyT]
							)
					  )
					: valuesRef.current
			);
			const newValues = onlySubmitMounted
				? Object.assign({}, valuesRef.current, result[0])
				: result[0];
			valuesRef.current = newValues;
			setValues(newValues);

			await Promise.all(
				Object.values(postSubmitHandlers.current).map((handler) =>
					handler((newValues as Record<"id", string>).id)
				)
			);

			if (onSubmit) {
				await onSubmit(newValues);
			}
		} catch (e) {
			// don't use this for validation errors
			if (e instanceof Error) {
				setUpdateError(e);
			}
			throw e;
		} finally {
			setSubmitting(false);
		}
	}, [
		validateForm,
		updateData,
		onlySubmitMounted,
		postSubmitHandlers,
		onSubmit,
		mountedFields,
	]);
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
		setTouched(state.touched);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// nested forms - saving
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		parentFormContext.setCustomState<FormNestedState>(nestedFormName, () => ({
			values,
			errors,
			touched,
		}));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		values,
		errors,
		touched,
		parentFormContext?.setCustomState,
		nestedFormName,
	]);

	// nested forms - validation and submit hook
	useEffect(() => {
		if (!parentFormContext || !nestedFormName) return;
		const validateNestedForm = () => {
			setTouched((prev) =>
				Object.fromEntries(Object.keys(prev).map((field) => [field, true]))
			);
			return validateForm();
		};
		const submitNestedForm = async (id: string) => {
			if (nestedFormPreSubmitHandler) {
				await nestedFormPreSubmitHandler(id);
			}
			return submitForm();
		};

		parentFormContext.setCustomValidationHandler(
			nestedFormName,
			validateNestedForm
		);
		parentFormContext.setPostSubmitHandler(nestedFormName, submitNestedForm);
		return () => {
			if (parentFormContext.onlyValidateMounted)
				parentFormContext.removeCustomValidationHandler(nestedFormName);
			if (parentFormContext.onlySubmitMounted)
				parentFormContext.removePostSubmitHandler(nestedFormName);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		parentFormContext?.setCustomValidationHandler,
		parentFormContext?.onlyValidateMounted,
		parentFormContext?.onlySubmitMounted,
		validateForm,
		nestedFormPreSubmitHandler,
		submitForm,
		nestedFormName,
	]);

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
			model: (model as unknown) as Model<ModelFieldName, PageVisibility, never>,
			relations: serverData && serverData[1] ? serverData[1] : {},
			setError,
			markFieldMounted,
			setCustomDirtyCounter,
			dirty,
			getCustomState,
			setCustomState,
			setPostSubmitHandler,
			removePostSubmitHandler,
			setCustomValidationHandler,
			removeCustomValidationHandler,
			onlySubmitMounted: !!onlySubmitMounted,
			onlyValidateMounted: !!onlyValidateMounted,
			submitting,
			values,
			initialValues: serverData ? serverData[0] : {},
			touched,
			errors,
			setFieldValue,
			handleBlur,
			setFieldTouched,
			resetForm,
			validateForm,
			parentFormContext: nestedFormName ? parentFormContext : null,
			readOnly: !!readOnly,
		}),
		[
			model,
			serverData,
			setError,
			markFieldMounted,
			dirty,
			getCustomState,
			setCustomState,
			setPostSubmitHandler,
			removePostSubmitHandler,
			setCustomValidationHandler,
			removeCustomValidationHandler,
			onlySubmitMounted,
			onlyValidateMounted,
			submitting,
			values,
			touched,
			errors,
			setFieldValue,
			handleBlur,
			setFieldTouched,
			resetForm,
			validateForm,
			parentFormContext,
			nestedFormName,
			readOnly,
		]
	);

	const formContextDataLite: FormContextDataLite = useMemo(
		() => ({
			onlySubmitMounted: !!onlySubmitMounted,
			onlyValidateMounted: !!onlyValidateMounted,
			readOnly: !!readOnly,
		}),
		[onlySubmitMounted, onlyValidateMounted, readOnly]
	);

	if (isLoading || isObjectEmpty(values)) {
		return <Loader />;
	}

	const displayError: Error | null = error || updateError;

	if (!serverData || serverData.length !== 2 || isObjectEmpty(serverData[0])) {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] [FormEngine] Data is faulty",
			serverData ? JSON.stringify(serverData, undefined, 4) : null
		);
		throw new Error("Data is not present, this should never happen");
	}

	return (
		<FormContextLite.Provider value={formContextDataLite}>
			<FormContext.Provider value={formContextData}>
				<form onSubmit={handleSubmit}>
					{displayError && <ErrorComponent error={displayError} />}
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
						/>
					)}
				</form>
			</FormContext.Provider>
		</FormContextLite.Provider>
	);
};

export default React.memo(Form) as typeof Form;
