import React from "react";
import { BasicFormPageRendererProps } from "../BasicFormPage";
import { FlowEngineFormProps } from "./FlowEngine";
export type FlowEngineFormPageButtonsProps<CustomPropsT> = BasicFormPageRendererProps<FlowEngineFormProps & CustomPropsT>;
declare const FlowEngineFormPageButtons: <CustomPropsT>(props: FlowEngineFormPageButtonsProps<CustomPropsT>) => React.JSX.Element;
declare const _default: typeof FlowEngineFormPageButtons;
export default _default;
