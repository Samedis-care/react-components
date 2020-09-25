import React, { useCallback, useState } from "react";
import { Formik } from "formik";
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
	children: (props: PageProps) => React.ReactNode;
}

export const FormContext = React.createContext<Model<
	ModelFieldName,
	PageVisibility,
	unknown
> | null>(null);

const Form = (props: FormProps) => {
	const { model, id } = props;
	const ErrorComponent = props.errorComponent;

	const [updateError, setUpdateError] = useState<Error | null>(null);
	const { isLoading, error, data } = model.get(id || null);
	const [updateData] = model.createOrUpdate();

	const onValidate = useCallback((values) => model.validate(values), [model]);

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
			<Formik
				initialValues={data}
				validate={onValidate}
				onSubmit={async (values, { setSubmitting, setValues }) => {
					try {
						const result = await updateData(values);
						if (!result) return;
						setValues(result, true);
					} catch (e) {
						setUpdateError(e as Error);
					} finally {
						setSubmitting(false);
					}
				}}
			>
				{({
					handleSubmit,
					isSubmitting,
					/* and other goodies */
				}) => (
					<form onSubmit={handleSubmit}>
						{updateError && <ErrorComponent error={updateError} />}
						{props.children({
							isSubmitting,
						})}
					</form>
				)}
			</Formik>
		</FormContext.Provider>
	);
};

export default React.memo(Form);
