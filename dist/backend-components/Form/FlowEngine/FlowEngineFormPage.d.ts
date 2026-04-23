import React from "react";
import { PageProps } from "../Form";
import { ModelFieldName } from "../../../backend-integration";
import { FlowEngineFormProps } from "./FlowEngine";
export interface FlowEngineFormPageProps<CustomPropsT> extends PageProps<ModelFieldName, FlowEngineFormProps & CustomPropsT> {
    /**
     * The actual form contents
     */
    children: React.ReactNode;
}
declare const _default: React.MemoExoticComponent<(<CustomPropsT>(props: FlowEngineFormPageProps<CustomPropsT>) => import("react/jsx-runtime").JSX.Element)>;
export default _default;
