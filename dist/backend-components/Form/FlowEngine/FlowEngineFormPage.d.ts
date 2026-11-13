import React from "react";
import { PageProps } from "../Form";
import { ModelUnknown } from "../../../backend-integration";
import { FlowEngineFormProps } from "./FlowEngine";
export interface FlowEngineFormPageProps<CustomPropsT> extends PageProps<ModelUnknown, FlowEngineFormProps & CustomPropsT> {
    /**
     * The actual form contents
     */
    children: React.ReactNode;
}
declare const FlowEngineFormPage: <CustomPropsT>(props: FlowEngineFormPageProps<CustomPropsT>) => React.JSX.Element;
declare const _default: typeof FlowEngineFormPage;
export default _default;
