import React, { useCallback, useContext, useMemo, useState } from "react";
import { PageProps, useFormContextLite } from "../Form";
import { ModelUnknown } from "../../../backend-integration";

export interface FlowEngineFormProps {
	buttons: React.ReactNode;
}

export type FlowFormProps<M extends ModelUnknown, CustomPropsT> = PageProps<
	M,
	FlowEngineFormProps & CustomPropsT
>;

export interface FlowStageProps<
	M extends ModelUnknown,
	StageT extends string,
	CustomPropsT,
> extends FlowStageContextType<StageT> {
	formProps: PageProps<M, CustomPropsT>;
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
	 * Like goToStage, but swallows the error instead of throwing
	 * @param nextStage The next stage
	 * @param submitToServer Submit to server?
	 * @returns false if submitting failed, true otherwise
	 * @remarks if submitting fails the stage is left unchanged. The error is shown by the form's
	 *          errorComponent and reported via the global error reporting config regardless.
	 * @see goToStage
	 * @see FormContextData.safeSubmit
	 */
	safeGoToStage: (
		nextStage: StageT,
		submitToServer: boolean,
	) => Promise<boolean>;
	/**
	 * the current stage
	 */
	stage: StageT;
}

export const FlowStageContext =
	React.createContext<FlowStageContextType<string> | null>(null);
export const useFlowStageContext = <StageT extends string>() => {
	const ctx = useContext(FlowStageContext);
	if (!ctx) throw new Error("FlowStageContext not set");
	return ctx as unknown as FlowStageContextType<StageT>;
};

export interface FlowEngineProps<
	M extends ModelUnknown,
	StageT extends string,
	CustomPropsT,
> {
	defaultStage: StageT;
	formProps: PageProps<M, CustomPropsT>;
	children: Record<
		StageT,
		React.ComponentType<FlowStageProps<M, StageT, CustomPropsT>>
	>;
}

const FlowEngine = <
	M extends ModelUnknown,
	StageT extends string,
	CustomPropsT,
>(
	props: FlowEngineProps<M, StageT, CustomPropsT>,
) => {
	const { defaultStage, formProps, children } = props;
	const [stage, setStage] = useState(defaultStage);
	const { flowEngine, submit } = useFormContextLite<ModelUnknown>();
	if (!flowEngine) throw new Error("Form not configured for flowEngine");

	const goToStage = useCallback(
		async (nextStage: StageT, submitToServer: boolean) => {
			await submit({ submitToServer });
			setStage(nextStage);
		},
		[submit],
	);

	const safeGoToStage = useCallback(
		async (nextStage: StageT, submitToServer: boolean): Promise<boolean> => {
			try {
				await goToStage(nextStage, submitToServer);
				return true;
			} catch {
				// ignore, error is shown regardless
				return false;
			}
		},
		[goToStage],
	);

	const context = useMemo(
		(): FlowStageContextType<StageT> => ({
			goToStage,
			safeGoToStage,
			stage,
		}),
		[goToStage, safeGoToStage, stage],
	);

	const StageComp: React.ComponentType<
		FlowStageProps<M, StageT, CustomPropsT>
	> = children[stage];
	return (
		<FlowStageContext.Provider
			value={context as unknown as FlowStageContextType<string>}
		>
			<StageComp
				formProps={formProps}
				goToStage={goToStage}
				safeGoToStage={safeGoToStage}
				stage={stage}
			/>
		</FlowStageContext.Provider>
	);
};

export default React.memo(FlowEngine) as typeof FlowEngine;
