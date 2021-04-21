import React, {
	CSSProperties,
	Dispatch,
	FormEvent,
	SetStateAction,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import Model, {
	ModelFieldName,
	ModelGetResponseRelations,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { isObjectEmpty, shallowCompare } from "../../utils";

/**
 * Pre submit handler for additional validations
 * Throw to cancel submit and display error.
 * Thrown error may be a Record<string, string> (validation error) or an normal Error (other error)
 */
export type PreSubmitHandler = () => Promise<void> | unknown;
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
}

/**
 * Context which stores information about the current form so it can be used by fields
 */
const FormContext = React.createContext<FormContextData | null>(null);
export const useFormContext = (): FormContextData => {
	const ctx = useContext(FormContext);
	if (!ctx) throw new Error("Form Context not set. Not using form engine?");
	return ctx;
};

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
	} = props;
	const ErrorComponent = props.errorComponent;

	// custom fields - dirty state
	const [customDirtyCounter, setCustomDirtyCounter] = useState(0);
	const customDirty = customDirtyCounter > 0;

	// custom fields - pre submit handlers
	const [preSubmitHandlers, setPreSubmitHandlers] = useState<
		Record<string, PreSubmitHandler>
	>({});
	const setPreSubmitHandler = useCallback(
		(field: string, handler: PreSubmitHandler) => {
			setPreSubmitHandlers((prev) => ({
				...prev,
				[field]: handler,
			}));
		},
		[setPreSubmitHandlers]
	);
	const removePreSubmitHandler = useCallback(
		(field: string) => {
			setPreSubmitHandlers((prev) => {
				const clone = { ...prev };
				delete clone[field];
				return clone;
			});
		},
		[setPreSubmitHandlers]
	);

	// custom fields - post submit handlers
	const [postSubmitHandlers, setPostSubmitHandlers] = useState<
		Record<string, PostSubmitHandler>
	>({});
	const setPostSubmitHandler = useCallback(
		(field: string, handler: PostSubmitHandler) => {
			setPostSubmitHandlers((prev) => ({
				...prev,
				[field]: handler,
			}));
		},
		[setPostSubmitHandlers]
	);
	const removePostSubmitHandler = useCallback(
		(field: string) => {
			setPostSubmitHandlers((prev) => {
				const clone = { ...prev };
				delete clone[field];
				return clone;
			});
		},
		[setPostSubmitHandlers]
	);

	// custom fields - state
	const [customFieldState, setCustomFieldState] = useState<
		Record<string, unknown>
	>({});
	const getCustomState = useCallback(
		<T extends unknown>(field: string): T => customFieldState[field] as T,
		[customFieldState]
	);
	const setCustomState = useCallback(
		<T extends unknown>(
			field: string,
			value: Dispatch<SetStateAction<T | undefined>>
		) => {
			setCustomFieldState((prev) => ({
				...prev,
				[field]:
					typeof value === "function"
						? value(prev[field] as T | undefined)
						: value,
			}));
		},
		[setCustomFieldState]
	);

	// main form handling
	const { isLoading, error, data: serverData } = model.get(id || null);
	const { mutateAsync: updateData } = model.createOrUpdate();

	const [updateError, setUpdateError] = useState<Error | null>(null);
	const [values, setValues] = useState<Record<string, unknown>>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const dirty =
		useMemo(
			() => (serverData ? shallowCompare(values, serverData[0]) : false),
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
	const validateField = useCallback(
		(field: string, value?: unknown) => {
			const doValidation = (value: unknown) => {
				const errors = model.validate(
					{ [field]: value } as Record<KeyT, unknown>,
					id ? "edit" : "create"
				);
				setErrors((prev) => {
					if (isObjectEmpty(errors)) {
						const next = { ...prev };
						delete next[field];
						return next;
					} else {
						return { ...prev, ...errors };
					}
				});
			};
			if (value) doValidation(value);
			else {
				setValues((prev) => {
					doValidation(prev[field]);
					return prev;
				});
			}
		},
		[id, model]
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
			setValues((prev) => ({ ...prev, [field]: value }));
			if (validate) validateField(field, value);
		},
		[validateField, setFieldTouched]
	);
	const resetForm = useCallback(() => {
		if (!serverData || !serverData[0]) return;
		setValues(serverData[0]);
	}, [serverData]);
	const validateForm = useCallback(
		() =>
			model.validate(
				values,
				id ? "edit" : "create",
				onlyValidateMounted
					? (Object.keys(mountedFields).filter(
							(field) => mountedFields[field as KeyT]
					  ) as KeyT[])
					: undefined
			),
		[model, values, id, onlyValidateMounted, mountedFields]
	);
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

		setValues(serverData[0]);
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
		setValues((prev) => {
			const next = { ...prev };
			untouchedFields
				.filter((field) => field in serverData[0])
				.forEach((field) => {
					next[field] = serverData[0][field as KeyT];
				});
			return next;
		});
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

			await Promise.all(
				Object.values(preSubmitHandlers).map((handler) => handler())
			);

			const result = await updateData(
				onlySubmitMounted
					? Object.fromEntries(
							Object.entries(values).filter(
								([key]) => mountedFields[key as KeyT]
							)
					  )
					: values
			);
			const newValues = onlySubmitMounted
				? Object.assign({}, values, result[0])
				: result[0];
			setValues(newValues);

			await Promise.all(
				Object.values(postSubmitHandlers).map((handler) =>
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
		preSubmitHandlers,
		updateData,
		onlySubmitMounted,
		values,
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
			setPreSubmitHandler,
			removePreSubmitHandler,
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
			setPreSubmitHandler,
			removePreSubmitHandler,
			onlySubmitMounted,
			onlyValidateMounted,
			submitting,
			values,
			touched,
			errors,
			setFieldValue,
			handleBlur,
			setFieldTouched,
		]
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
	);
};

export default React.memo(Form) as typeof Form;
