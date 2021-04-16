import React, {
	CSSProperties,
	Dispatch,
	SetStateAction,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { Formik, FormikHelpers } from "formik";
import Model, {
	ModelData,
	ModelFieldName,
	ModelGetResponseRelations,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { FormikState } from "formik/dist/types";
import { isObjectEmpty } from "../../utils";
import FormUpdateListener from "./FormUpdateListener";

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
	reset: (nextState?: Partial<FormikState<Record<KeyT, unknown>>>) => void;
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
	 * custom fields dirty flag
	 * combine (||) with formik dirty flag to get correct dirty state
	 */
	customDirty: boolean;
	/**
	 * @see FormProps.onlySubmitMounted
	 */
	onlySubmitMounted: boolean;
	/**
	 * @see FormProps.onlyValidateMounted
	 */
	onlyValidateMounted: boolean;
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
	const { isLoading, error, data } = model.get(id || null);
	const { mutateAsync: updateData } = model.createOrUpdate();

	const [updateError, setUpdateError] = useState<Error | null>(null);

	// main form handling - mounted state tracking
	const [mountedFields, setMountedFields] = useState(
		() =>
			Object.fromEntries(
				Object.keys(model.fields).map((field) => [field, false])
			) as Record<KeyT, boolean>
	);
	const markFieldMounted = useCallback((field: string, mounted: boolean) => {
		setMountedFields((prev) => ({ ...prev, [field as KeyT]: mounted }));
	}, []);

	// main form - validations
	const onValidate = useCallback(
		(values) =>
			model.validate(
				values,
				id ? "edit" : "create",
				onlyValidateMounted
					? (Object.keys(mountedFields).filter(
							(field) => mountedFields[field as KeyT]
					  ) as KeyT[])
					: undefined
			),
		[onlyValidateMounted, mountedFields, model, id]
	);

	// main form - submit handler
	const onSubmitHandler = useCallback(
		async (
			values: ModelData<KeyT>,
			{ setSubmitting, setValues }: FormikHelpers<ModelData<KeyT>>
		): Promise<void> => {
			try {
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
				setUpdateError(e as Error);
				throw e;
			} finally {
				setSubmitting(false);
			}
		},
		[postSubmitHandlers, updateData, onlySubmitMounted, onSubmit, mountedFields]
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
			relations: data && data[1] ? data[1] : {},
			setError,
			markFieldMounted,
			setCustomDirtyCounter,
			customDirty,
			getCustomState,
			setCustomState,
			setPostSubmitHandler,
			removePostSubmitHandler,
			onlySubmitMounted: !!onlySubmitMounted,
			onlyValidateMounted: !!onlyValidateMounted,
		}),
		[
			model,
			data,
			setError,
			markFieldMounted,
			customDirty,
			getCustomState,
			setCustomState,
			setPostSubmitHandler,
			removePostSubmitHandler,
			onlySubmitMounted,
			onlyValidateMounted,
		]
	);

	if (isLoading) {
		return <Loader />;
	}

	const displayError: Error | null = error || updateError;

	if (!data || data.length !== 2 || isObjectEmpty(data[0])) {
		// eslint-disable-next-line no-console
		console.error(
			"[Components-Care] [FormEngine] Data is faulty",
			data ? JSON.stringify(data, undefined, 4) : null
		);
		throw new Error("Data is not present, this should never happen");
	}

	return (
		<FormContext.Provider value={formContextData}>
			<Formik
				initialValues={data[0]}
				validate={onValidate}
				onSubmit={onSubmitHandler}
			>
				{({
					submitForm,
					resetForm,
					handleSubmit,
					isSubmitting,
					values,
					dirty,
					/* and other goodies */
				}) => (
					<form onSubmit={handleSubmit}>
						<FormUpdateListener backendData={data[0]} />
						{displayError && <ErrorComponent error={displayError} />}
						{isLoading ? (
							<div style={loaderContainerStyles}>
								<Loader />
							</div>
						) : (
							<Children
								isSubmitting={isSubmitting}
								values={props.renderConditionally ? values : undefined}
								submit={submitForm}
								reset={resetForm}
								dirty={dirty || customDirty}
								id={id}
								customProps={customProps}
							/>
						)}
					</form>
				)}
			</Formik>
		</FormContext.Provider>
	);
};

export default React.memo(Form) as typeof Form;
