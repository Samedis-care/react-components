import React, { CSSProperties, useCallback, useMemo, useState } from "react";
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
}

/**
 * Context which stores information about the current form so it can be used by fields
 */
export const FormContext = React.createContext<FormContextData | null>(null);

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
	const { model, id, children, onSubmit, customProps } = props;
	const ErrorComponent = props.errorComponent;

	const [updateError, setUpdateError] = useState<Error | null>(null);
	const { isLoading, error, data } = model.get(id || null);
	const { mutateAsync: updateData } = model.createOrUpdate();

	const onValidate = useCallback(
		(values) => model.validate(values, id ? "edit" : "create"),
		[model, id]
	);
	const onSubmitHandler = useCallback(
		async (
			values: ModelData<KeyT>,
			{ setSubmitting, setValues }: FormikHelpers<ModelData<KeyT>>
		): Promise<void> => {
			try {
				const result = await updateData(values);
				setValues(result[0]);
				if (onSubmit) {
					await onSubmit(result[0]);
				}
			} catch (e) {
				setUpdateError(e as Error);
				throw e;
			} finally {
				setSubmitting(false);
			}
		},
		[updateData, setUpdateError, onSubmit]
	);

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
		}),
		[model, setError, data]
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
								dirty={dirty}
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
