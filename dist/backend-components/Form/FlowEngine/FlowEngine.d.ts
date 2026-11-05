import React from "react";
import { FormSubmitOptions, PageProps } from "../Form";
import { ModelUnknown } from "../../../backend-integration";
export interface FlowEngineFormProps {
    buttons: React.ReactNode;
}
export type FlowFormProps<M extends ModelUnknown, CustomPropsT> = PageProps<M, FlowEngineFormProps & CustomPropsT>;
export interface FlowStageProps<M extends ModelUnknown, StageT extends string, CustomPropsT> extends FlowStageContextType<StageT> {
    formProps: PageProps<M, CustomPropsT>;
}
/**
 * The options of the submit a stage change makes, besides submitToServer
 */
export type FlowStageSubmitOptions = Omit<FormSubmitOptions, "submitToServer">;
export interface FlowStageContextType<StageT extends string> {
    /**
     * Go to next stage (or current stage to submit)
     * @param nextStage The next stage
     * @param submitToServer Submit to server?
     * @param options The submit's further options, e.g. ignoreWarnings when the
     *                warnings were already confirmed by a submit just before
     * @throws ValidationError
     * @remarks this calls FormEngine submitForm and if successful sets the stage
     */
    goToStage: (nextStage: StageT, submitToServer: boolean, options?: FlowStageSubmitOptions) => Promise<void>;
    /**
     * Like goToStage, but swallows the error instead of throwing
     * @param nextStage The next stage
     * @param submitToServer Submit to server?
     * @param options The submit's further options, see goToStage
     * @returns false if submitting failed, true otherwise
     * @remarks if submitting fails the stage is left unchanged. The error is shown by the form's
     *          errorComponent and reported via the global error reporting config regardless.
     * @see goToStage
     * @see FormContextData.safeSubmit
     */
    safeGoToStage: (nextStage: StageT, submitToServer: boolean, options?: FlowStageSubmitOptions) => Promise<boolean>;
    /**
     * the current stage
     */
    stage: StageT;
}
export declare const FlowStageContext: React.Context<FlowStageContextType<string> | null>;
export declare const useFlowStageContext: <StageT extends string>() => FlowStageContextType<StageT>;
export interface FlowEngineProps<M extends ModelUnknown, StageT extends string, CustomPropsT> {
    defaultStage: StageT;
    formProps: PageProps<M, CustomPropsT>;
    children: Record<StageT, React.ComponentType<FlowStageProps<M, StageT, CustomPropsT>>>;
}
declare const FlowEngine: <M extends ModelUnknown, StageT extends string, CustomPropsT>(props: FlowEngineProps<M, StageT, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof FlowEngine;
export default _default;
