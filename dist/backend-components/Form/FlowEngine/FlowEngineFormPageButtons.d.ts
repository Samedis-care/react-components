import React from "react";
import { BasicFormPageRendererProps } from "../BasicFormPage";
import { FlowEngineFormProps } from "./FlowEngine";
export type FlowEngineFormPageButtonsProps<CustomPropsT> = BasicFormPageRendererProps<FlowEngineFormProps & CustomPropsT>;
declare const _default: React.MemoExoticComponent<(<CustomPropsT>(props: FlowEngineFormPageButtonsProps<CustomPropsT>) => React.JSX.Element)>;
export default _default;
