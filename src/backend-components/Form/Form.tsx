import React, { useCallback, useMemo, useState } from "react";
import { Formik, FormikHelpers } from "formik";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import Loader from "../../standalone/Loader";

export interface ErrorComponentProps {
	error: Error;
}

export interface PageProps {
	/**
	 * Indicates if the form is currently being submitted.
	 * All submit buttons should be disabled if "isSubmitting" is true.
	 */
	isSubmitting: boolean;
}

export interface FormProps {
	model: Model<ModelFieldName, PageVisibility, unknown>;
	id?: string | null;
	errorComponent: React.ComponentType<ErrorComponentProps>;
	children: React.ComponentType<PageProps>;
}

export const FormContext = React.createContext<Model<
	ModelFieldName,
	PageVisibility,
	unknown
> | null>(null);

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
				setValues(result, true);
			} catch (e) {
				setUpdateError(e as Error);
			} finally {
				setSubmitting(false);
			}
		},
		[updateData, setUpdateError]
	);

	const Children = useMemo(() => React.memo(children), [children]);

	if (isLoading) {
		return <Loader />;
	}

	if (error) {
		return <ErrorComponent error={error} />;
	}

	if (!data) {
		throw new Error("Data is not present, this should never happen");
	}

	return (
		<FormContext.Provider value={model}>
			<Formik initialValues={data} validate={onValidate} onSubmit={onSubmit}>
				{({
					handleSubmit,
					isSubmitting,
					/* and other goodies */
				}) => (
					<form onSubmit={handleSubmit}>
						{updateError && <ErrorComponent error={updateError} />}
						<Children isSubmitting={isSubmitting} />
					</form>
				)}
			</Formik>
		</FormContext.Provider>
	);
};

export default React.memo(Form);
