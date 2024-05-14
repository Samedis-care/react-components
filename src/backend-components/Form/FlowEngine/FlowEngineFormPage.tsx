import React from "react";
import BasicFormPage from "../BasicFormPage";
import FlowEngineFormPageButtons from "./FlowEngineFormPageButtons";
import { PageProps } from "../Form";
import { ModelFieldName } from "../../../backend-integration";
import { FlowEngineFormProps } from "./FlowEngine";

export interface FlowEngineFormPageProps<CustomPropsT>
	extends PageProps<ModelFieldName, FlowEngineFormProps & CustomPropsT> {
	/**
	 * The actual form contents
	 */
	children: React.ReactNode;
}

const FlowEngineFormPage = <CustomPropsT,>(
	props: FlowEngineFormPageProps<CustomPropsT>,
) => {
	const { children } = props;

	return (
		<BasicFormPage {...props} form={children} childrenProps={undefined}>
			{FlowEngineFormPageButtons}
		</BasicFormPage>
	);
};

export default React.memo(FlowEngineFormPage);
