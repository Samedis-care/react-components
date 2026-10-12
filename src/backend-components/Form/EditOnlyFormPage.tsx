import React from "react";
import { ModelUnknown } from "../../backend-integration";
import { PageProps } from "./Form";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";

export interface EditOnlyFormPageProps extends PageProps<
	ModelUnknown,
	undefined
> {
	/**
	 * The actual form contents
	 */
	children: React.ReactNode;
}

const EditOnlyFormPage = (props: EditOnlyFormPageProps) => {
	const { children } = props;

	return (
		<BasicFormPage {...props} form={children} childrenProps={undefined}>
			{DefaultFormPageButtons}
		</BasicFormPage>
	);
};

export default React.memo(EditOnlyFormPage);
