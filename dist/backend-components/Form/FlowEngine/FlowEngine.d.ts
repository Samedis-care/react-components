import React from "react";
import { PageProps } from "../Form";
export interface FlowEngineFormProps {
    buttons: React.ReactNode;
}
export type FlowFormProps<KeyT extends string, CustomPropsT> = PageProps<KeyT, FlowEngineFormProps & CustomPropsT>;
export interface FlowStageProps<KeyT extends string, StageT extends string, CustomPropsT> {
    formProps: PageProps<KeyT, CustomPropsT>;
    goToStage: (nextStage: StageT, submitToServer: boolean) => Promise<void>;
}
export interface FlowEngineProps<KeyT extends string, StageT extends string, CustomPropsT> {
    defaultStage: StageT;
    formProps: PageProps<KeyT, CustomPropsT>;
    children: Record<StageT, React.ComponentType<FlowStageProps<KeyT, StageT, CustomPropsT>>>;
}
declare const _default: <KeyT extends string, StageT extends string, CustomPropsT>(props: FlowEngineProps<KeyT, StageT, CustomPropsT>) => React.JSX.Element;
export default _default;
