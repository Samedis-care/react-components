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
     * @param nextStage The next stage, a key of FlowEngineProps.children
     * @param submitToServer Submit to server?
     * @param options The submit's further options, e.g. ignoreWarnings when the
     *                warnings were already confirmed by a submit just before
     * @throws ValidationError
     * @throws Error that names nextStage when FlowEngineProps.children has no component for
     *         it. Nothing is submitted then, the stage stays, and the error is reported via
     *         the global error reporting config and logged to the console.
     * @remarks this calls FormEngine submitForm and if successful sets the stage
     */
    goToStage: (nextStage: StageT, submitToServer: boolean, options?: FlowStageSubmitOptions) => Promise<void>;
    /**
     * Like goToStage, but swallows the error instead of throwing
     * @param nextStage The next stage
     * @param submitToServer Submit to server?
     * @param options The submit's further options, see goToStage
     * @returns false if submitting failed or nextStage has no component, true otherwise
     * @remarks if submitting fails the stage is left unchanged. The error is shown by the form's
     *          errorComponent and reported via the global error reporting config regardless.
     *          A nextStage without a component is reported and logged, see goToStage.
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
/**
 * The stage API of the nearest FlowEngine, for components below a stage (a stepper,
 * buttons deeper in the tree)
 * @typeParam StageT The FlowEngine's union of stage names. It is not checked against the
 *            FlowEngine, and without it any string compiles; goToStage rejects a name
 *            that has no stage.
 * @throws Error "FlowStageContext not set" outside a FlowEngine
 */
export declare const useFlowStageContext: <StageT extends string>() => FlowStageContextType<StageT>;
export interface FlowEngineProps<M extends ModelUnknown, StageT extends string, CustomPropsT> {
    /**
     * The stage shown first, a key of children
     * @remarks A name without a component in children fails the render with the error
     *          goToStage rejects with for it.
     */
    defaultStage: StageT;
    formProps: PageProps<M, CustomPropsT>;
    /**
     * One component per stage, keyed by stage name
     * @remarks Only the object's own keys are stages, and only those with a component.
     */
    children: Record<StageT, React.ComponentType<FlowStageProps<M, StageT, CustomPropsT>>>;
    /**
     * The name of each stage for assistive technology, translated: the step title the user
     * sees, e.g. `{ contact: "Step 2 of 4: Contact" }`.
     *
     * The stage is rendered in a container that is a `group` with this name. A stage change
     * moves the focus to that container (see disableAutoFocus), so screen readers announce
     * the name. A stage without a name gets a container without a role or name, and its
     * stage change is not announced.
     * @remarks Pass a module constant or a memoized object, so FlowEngine does not render
     *          again for a new object with the same names.
     * @default undefined (no stage has a name)
     */
    stageLabels?: Partial<Record<StageT, string>>;
    /**
     * Leaves the focus and the scroll position as they are after a stage change, for an app
     * that moves the focus itself.
     *
     * Without it, after a stage change the new stage's container takes the focus (it shows
     * no focus ring; the next Tab goes to the first control of the stage), and if the start
     * of the new stage is scrolled out of view, it is scrolled to the top of its scroll area
     * (the window, a dialog's content). Nothing changes when the new stage focused a control
     * itself (`autoFocus`) or when the focus is on an element outside the FlowEngine, e.g. a
     * stepper around it. The first stage after mount is never focused or scrolled, and
     * neither is the shown stage when goToStage stays on it.
     * @default false
     */
    disableAutoFocus?: boolean;
}
/**
 * The FlowEngine props a theme can set (`components.CcFlowEngine.defaultProps`)
 */
export type FlowEngineThemeProps = Pick<FlowEngineProps<ModelUnknown, string, unknown>, "disableAutoFocus">;
/**
 * The theme slots of FlowEngine (`components.CcFlowEngine.styleOverrides`): `root` is the
 * container of the stage (a flex column that grows, so a stage that fills its parent still
 * does; no outline when it has the focus)
 */
export type FlowEngineClassKey = "root";
declare const FlowEngine: <M extends ModelUnknown, StageT extends string, CustomPropsT>(inProps: FlowEngineProps<M, StageT, CustomPropsT>) => React.JSX.Element;
declare const _default: typeof FlowEngine;
export default _default;
