import React, { useMemo } from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
import { PageProps } from "./Form";
import { CrudFormProps } from "../CRUD";
import { ModelUnknown } from "../../backend-integration";

export interface DefaultFormPageProps extends PageProps<
	ModelUnknown,
	CrudFormProps
> {
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
	/**
	 * Label of the Save button, instead of the translated "Save". Its text is the button's
	 * accessible name.
	 * @default the translated "Save" (common.buttons.save); also used for null
	 */
	textButtonSave?: React.ReactNode;
	/**
	 * Label of the Back button, instead of the translated "Back". Its text is the button's
	 * accessible name.
	 * @default the translated "Back" (common.buttons.back); also used for null
	 */
	textButtonBack?: React.ReactNode;
}

const DefaultFormPage = (props: DefaultFormPageProps) => {
	const { children, extraButtons, textButtonSave, textButtonBack } = props;

	const childrenProps = useMemo(
		() => ({ extraButtons, textButtonSave, textButtonBack }),
		[extraButtons, textButtonSave, textButtonBack],
	);

	return (
		<BasicFormPage {...props} form={children} childrenProps={childrenProps}>
			{DefaultFormPageButtons}
		</BasicFormPage>
	);
};

export default React.memo(DefaultFormPage);
