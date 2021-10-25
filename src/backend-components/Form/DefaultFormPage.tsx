import React from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
import { PageProps } from "./Form";
import { CrudFormProps } from "../CRUD";
import { ModelFieldName } from "../../backend-integration";

export interface DefaultFormPageProps
	extends PageProps<ModelFieldName, CrudFormProps> {
	/**
	 * The actual form contents
	 */
	children: React.ReactNode;
	/**
	 * Show back button only when not enough permission
	 */
	showBackButtonOnly?: boolean;
	/**
	 * Confirm dialog message
	 */
	confirmDialogMessage?: string;
}

const DefaultFormPage = (props: DefaultFormPageProps) => {
	const { children } = props;

	return (
		<BasicFormPage {...props} form={children} childrenProps={undefined}>
			{DefaultFormPageButtons}
		</BasicFormPage>
	);
};

export default React.memo(DefaultFormPage);
