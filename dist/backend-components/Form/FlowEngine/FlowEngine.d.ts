import React from "react";
import { PageProps } from "../Form";
export interface FlowEngineFormProps {
    buttons: React.ReactNode;
}
export type FlowFormProps<KeyT extends string, CustomPropsT> = PageProps<KeyT, FlowEngineFormProps & CustomPropsT>;
export interface FlowStageProps<KeyT extends string, StageT extends string, CustomPropsT> {
    formProps: PageProps<KeyT, CustomPropsT>;
    /**
     * Go to next stage (or current stage to submit)
     * @param nextStage The next stage
     * @param submitToServer Submit to server?
     * @throws ValidationError
     * @remarks this calls FormEngine submitForm and if successful sets the stage
     */
    goToStage: (nextStage: StageT, submitToServer: boolean) => Promise<void>;
}
export interface FlowEngineProps<KeyT extends string, StageT extends string, CustomPropsT> {
    defaultStage: StageT;
    formProps: PageProps<KeyT, CustomPropsT>;
    children: Record<StageT, React.ComponentType<FlowStageProps<KeyT, StageT, CustomPropsT>>>;
}
declare const FlowEngine: <KeyT extends string, StageT extends string, CustomPropsT>(props: FlowEngineProps<KeyT, StageT, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof FlowEngine;
export default _default;