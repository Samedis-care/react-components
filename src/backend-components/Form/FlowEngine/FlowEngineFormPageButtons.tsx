import React from "react";
import { BasicFormPageRendererProps } from "../BasicFormPage";
import { FormButtons } from "../../../standalone";
import { FlowEngineFormProps } from "./FlowEngine";

export type FlowEngineFormPageButtonsProps<CustomPropsT> =
	BasicFormPageRendererProps<FlowEngineFormProps & CustomPropsT>;

const FlowEngineFormPageButtons = <CustomPropsT,>(
	props: FlowEngineFormPageButtonsProps<CustomPropsT>,
) => {
	return <FormButtons>{props.customProps.buttons}</FormButtons>;
};

export default React.memo(FlowEngineFormPageButtons);
