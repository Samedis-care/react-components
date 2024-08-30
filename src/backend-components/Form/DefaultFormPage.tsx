import React, { useMemo } from "react";
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
	 * Automatically go back after submit
	 */
	autoBack?: boolean;
	/**
	 * Show back button only when not enough permission
	 */
	showBackButtonOnly?: boolean;
	/**
	 * Confirm dialog message
	 */
	confirmDialogMessage?: string;
	/**
	 * Extra buttons
	 */
	extraButtons?: React.ReactNode;
}

const DefaultFormPage = (props: DefaultFormPageProps) => {
	const { children, extraButtons } = props;

	const childrenProps = useMemo(() => ({ extraButtons }), [extraButtons]);

	return (
		<BasicFormPage {...props} form={children} childrenProps={childrenProps}>
			{DefaultFormPageButtons}
		</BasicFormPage>
	);
};

export default React.memo(DefaultFormPage);
