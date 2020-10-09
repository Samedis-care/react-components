import React, { useCallback, useMemo, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";
import { FormikState } from "formik/dist/types";

export interface ErrorComponentProps {
	/**
	 * The last error that happened
	 */
	error: Error;
}

export interface PageProps {
	/**
	 * Indicates if the form is currently being submitted.
	 * All submit buttons should be disabled if "isSubmitting" is true.
	 */
	isSubmitting: boolean;
	/**
	 * The values of the form, can be used for conditional rendering.
	 * Only present if renderConditionally is set to true in FormProps
	 */
	values?: Record<string, unknown>;
	/**
	 * Function to trigger form submit
	 */
	submit: () => Promise<void>;
	/**
	 * Function to trigger form reset
	 */
	reset: (nextState?: Partial<FormikState<Record<string, unknown>>>) => void;
}

export interface FormProps {
	/**
	 * The data model this form follows
	 */
	model: Model<ModelFieldName, PageVisibility, unknown | null>;
	/**
	 * The current data entry id
	 */
	id?: string | null;
	/**
	 * The error component that is used to display errors
	 */
	errorComponent: React.ComponentType<ErrorComponentProps>;
	/**
	 * The form contents
	 */
	children: React.ComponentType<PageProps>;
	/**
	 * Rerender page props if values changes
	 */
	renderConditionally?: boolean;
}

export interface FormContextData {
	/**
	 * The data model of this form
	 */
	model: Model<ModelFieldName, PageVisibility, unknown | null>;
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

const Form = (props: FormProps) => {
	const { model, id, children } = props;
	const ErrorComponent = props.errorComponent;

	const [updateError, setUpdateError] = useState<Error | null>(null);
	const { isLoading, error, data } = model.get(id || null);
	const [updateData] = model.createOrUpdate();

	const onValidate = useCallback((values) => model.validate(values), [model]);
	const onSubmit = useCallback(
		async (
			values: NonNullable<typeof data>,
			{ setSubmitting, setValues }: FormikHelpers<NonNullable<typeof data>>
		): Promise<void> => {
			try {
				const result = await updateData(values);
				if (!result) return;
				setValues(result);
			} catch (e) {
				setUpdateError(e as Error);
			} finally {
				setSubmitting(false);
			}
		},
		[updateData, setUpdateError]
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
			model,
			setError,
		}),
		[model, setError]
	);

	if (isLoading) {
		return <Loader />;
	}

	const displayError: Error | null = error || updateError;

	if (!data) {
		throw new Error("Data is not present, this should never happen");
	}

	return (
		<FormContext.Provider value={formContextData}>
			<Formik
				initialValues={data || {}}
				validate={onValidate}
				onSubmit={onSubmit}
			>
				{({
					submitForm,
					resetForm,
					handleSubmit,
					isSubmitting,
					values,
					/* and other goodies */
				}) => (
					<form onSubmit={handleSubmit}>
						{displayError && <ErrorComponent error={displayError} />}
						<Children
							isSubmitting={isSubmitting}
							values={props.renderConditionally ? values : undefined}
							submit={submitForm}
							reset={resetForm}
						/>
					</form>
				)}
			</Formik>
		</FormContext.Provider>
	);
};

export default React.memo(Form);
