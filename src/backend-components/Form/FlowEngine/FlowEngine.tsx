import React, { useCallback, useState } from "react";
import { PageProps, useFormContextLite } from "../Form";

export interface FlowEngineFormProps {
	buttons: React.ReactNode;
}

export type FlowFormProps<KeyT extends string, CustomPropsT> = PageProps<
	KeyT,
	FlowEngineFormProps & CustomPropsT
>;

export interface FlowStageProps<
	KeyT extends string,
	StageT extends string,
	CustomPropsT,
> {
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

export interface FlowEngineProps<
	KeyT extends string,
	StageT extends string,
	CustomPropsT,
> {
	defaultStage: StageT;
	formProps: PageProps<KeyT, CustomPropsT>;
	children: Record<
		StageT,
		React.ComponentType<FlowStageProps<KeyT, StageT, CustomPropsT>>
	>;
}

const FlowEngine = <KeyT extends string, StageT extends string, CustomPropsT>(
	props: FlowEngineProps<KeyT, StageT, CustomPropsT>,
) => {
	const { defaultStage, formProps, children } = props;
	const [stage, setStage] = useState(defaultStage);
	const { flowEngine, submit } = useFormContextLite();
	if (!flowEngine) throw new Error("Form not configured for flowEngine");

	const goToStage = useCallback(
		async (nextStage: StageT, submitToServer: boolean) => {
			await submit({ submitToServer });
			setStage(nextStage);
		},
		[submit],
	);

	const StageComp: React.ComponentType<
		FlowStageProps<KeyT, StageT, CustomPropsT>
	> = children[stage];
	return <StageComp formProps={formProps} goToStage={goToStage} />;
};

export default React.memo(FlowEngine) as typeof FlowEngine;
