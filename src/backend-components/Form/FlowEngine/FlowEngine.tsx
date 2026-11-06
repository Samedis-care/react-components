import React, {
	useCallback,
	useContext,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { styled, useThemeProps } from "@mui/material";
import { FormSubmitOptions, PageProps, useFormContextLite } from "../Form";
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
	goToStage: (
		nextStage: StageT,
		submitToServer: boolean,
		options?: FlowStageSubmitOptions,
	) => Promise<void>;
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
	safeGoToStage: (
		nextStage: StageT,
		submitToServer: boolean,
		options?: FlowStageSubmitOptions,
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
export type FlowEngineThemeProps = Pick<
	FlowEngineProps<ModelUnknown, string, unknown>,
	"disableAutoFocus"
>;

/**
 * The theme slots of FlowEngine (`components.CcFlowEngine.styleOverrides`): `root` is the
 * container of the stage (a flex column that grows, so a stage that fills its parent still
 * does; no outline when it has the focus)
 */
export type FlowEngineClassKey = "root";

const FlowEngineRoot = styled("div", { name: "CcFlowEngine", slot: "root" })({
	display: "flex",
	flexDirection: "column",
	flexGrow: 1,
	outline: "none",
});

/**
 * Whether the top edge of the element is above the visible area of the window or of an
 * ancestor that clips it (a scroll area)
 * @param el The element
 */
const isStartScrolledAway = (el: HTMLElement): boolean => {
	// tolerance for subpixel positions
	const top = el.getBoundingClientRect().top + 1;
	if (top < 0) return true;
	for (let parent = el.parentElement; parent; parent = parent.parentElement) {
		if (getComputedStyle(parent).overflowY === "visible") continue;
		if (top < parent.getBoundingClientRect().top + parent.clientTop)
			return true;
	}
	return false;
};

const FlowEngine = <
	M extends ModelUnknown,
	StageT extends string,
	CustomPropsT,
>(
	inProps: FlowEngineProps<M, StageT, CustomPropsT>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcFlowEngine" });
	const { defaultStage, formProps, children, stageLabels, disableAutoFocus } =
		props;
	const [stage, setStage] = useState(defaultStage);
	const { flowEngine, submit } = useFormContextLite<ModelUnknown>();
	if (!flowEngine) throw new Error("Form not configured for flowEngine");

	const goToStage = useCallback(
		async (
			nextStage: StageT,
			submitToServer: boolean,
			options?: FlowStageSubmitOptions,
		) => {
			await submit({ ...options, submitToServer });
			setStage(nextStage);
		},
		[submit],
	);

	const safeGoToStage = useCallback(
		async (
			nextStage: StageT,
			submitToServer: boolean,
			options?: FlowStageSubmitOptions,
		): Promise<boolean> => {
			try {
				await goToStage(nextStage, submitToServer, options);
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

	// after a stage change: the old stage's elements are gone, and with them the focus of
	// the button that changed the stage. A layout effect, so it runs before the browser paints
	// the old scroll position and before a dialog's focus trap takes the focus back, and after
	// the new stage's autoFocus.
	const rootRef = useRef<HTMLDivElement>(null);
	const shownStage = useRef(stage);
	useLayoutEffect(() => {
		if (shownStage.current === stage) return;
		shownStage.current = stage;
		const root = rootRef.current;
		if (disableAutoFocus || !root) return;
		const active = root.ownerDocument.activeElement;
		// the focus fell to the page or to a container around the flow (a dialog's); focus
		// in the new stage or elsewhere outside the flow stays where it is
		if (active && !active.contains(root)) return;
		root.focus({ preventScroll: true });
		if (isStartScrolledAway(root)) root.scrollIntoView({ block: "start" });
	}, [stage, disableAutoFocus]);

	const StageComp: React.ComponentType<
		FlowStageProps<M, StageT, CustomPropsT>
	> = children[stage];
	const stageLabel = stageLabels?.[stage];
	return (
		<FlowStageContext.Provider
			value={context as unknown as FlowStageContextType<string>}
		>
			<FlowEngineRoot
				ref={rootRef}
				tabIndex={-1}
				role={stageLabel ? "group" : undefined}
				aria-label={stageLabel}
			>
				<StageComp
					formProps={formProps}
					goToStage={goToStage}
					safeGoToStage={safeGoToStage}
					stage={stage}
				/>
			</FlowEngineRoot>
		</FlowStageContext.Provider>
	);
};

export default React.memo(FlowEngine) as typeof FlowEngine;
