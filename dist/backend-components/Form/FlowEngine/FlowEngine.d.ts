import React from "react";
import { PageProps } from "../Form";
export interface FlowEngineFormProps {
    buttons: React.ReactNode;
}
export type FlowFormProps<KeyT extends string, CustomPropsT> = PageProps<KeyT, FlowEngineFormProps & CustomPropsT>;
export interface FlowStageProps<KeyT extends string, StageT extends string, CustomPropsT> extends FlowStageContextType<StageT> {
    formProps: PageProps<KeyT, CustomPropsT>;
}
export interface FlowStageContextType<StageT extends string> {
    /**
     * Go to next stage (or current stage to submit)
     * @param nextStage The next stage
     * @param submitToServer Submit to server?
     * @throws ValidationError
     * @remarks this calls FormEngine submitForm and if successful sets the stage
     */
    goToStage: (nextStage: StageT, submitToServer: boolean) => Promise<void>;
    /**
     * the current stage
     */
    stage: StageT;
}
export declare const FlowStageContext: React.Context<FlowStageContextType<string> | null>;
export declare const useFlowStageContext: <StageT extends string>() => FlowStageContextType<StageT>;
export interface FlowEngineProps<KeyT extends string, StageT extends string, CustomPropsT> {
    defaultStage: StageT;
    formProps: PageProps<KeyT, CustomPropsT>;
    children: Record<StageT, React.ComponentType<FlowStageProps<KeyT, StageT, CustomPropsT>>>;
}
declare const FlowEngine: <KeyT extends string, StageT extends string, CustomPropsT>(props: FlowEngineProps<KeyT, StageT, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof FlowEngine;
export default _default;
