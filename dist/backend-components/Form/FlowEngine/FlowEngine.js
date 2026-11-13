import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { styled, useThemeProps } from "@mui/material";
import { useFormContextLite } from "../Form";
import { captureError } from "../../../framework/ErrorReporting";
export const FlowStageContext = React.createContext(null);
/**
 * The stage API of the nearest FlowEngine, for components below a stage (a stepper,
 * buttons deeper in the tree)
 * @typeParam StageT The FlowEngine's union of stage names. It is not checked against the
 *            FlowEngine, and without it any string compiles; goToStage rejects a name
 *            that has no stage.
 * @throws Error "FlowStageContext not set" outside a FlowEngine
 */
export const useFlowStageContext = () => {
    const ctx = useContext(FlowStageContext);
    if (!ctx)
        throw new Error("FlowStageContext not set");
    return ctx;
};
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
const isStartScrolledAway = (el) => {
    // tolerance for subpixel positions
    const top = el.getBoundingClientRect().top + 1;
    if (top < 0)
        return true;
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
        if (getComputedStyle(parent).overflowY === "visible")
            continue;
        if (top < parent.getBoundingClientRect().top + parent.clientTop)
            return true;
    }
    return false;
};
/**
 * The component of a stage
 * @param children FlowEngineProps.children
 * @param stage The stage name
 * @returns The component, or undefined if children has none for the name (also for a name
 *          every object inherits, such as "constructor")
 */
const getStageComponent = (children, stage) => Object.prototype.hasOwnProperty.call(children, stage)
    ? (children[stage] ?? undefined)
    : undefined;
/**
 * The error for a stage name without a component in FlowEngineProps.children
 * @param stage The stage name
 */
const unknownStageError = (stage) => new Error(`FlowEngine: children has no component for stage "${stage}"`);
const FlowEngine = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFlowEngine" });
    const { defaultStage, formProps, children, stageLabels, disableAutoFocus } = props;
    const [stage, setStage] = useState(defaultStage);
    const { flowEngine, submit } = useFormContextLite();
    if (!flowEngine)
        throw new Error("Form not configured for flowEngine");
    // the stages of the latest render, so goToStage checks a name against them and keeps
    // its identity when the app passes a new object
    const childrenRef = useRef(children);
    childrenRef.current = children;
    const goToStage = useCallback(async (nextStage, submitToServer, options) => {
        // checked before the submit, so an unknown name neither stages nor saves anything,
        // and the render below never gets a stage without a component
        if (!getStageComponent(childrenRef.current, nextStage)) {
            const error = unknownStageError(nextStage);
            captureError(error, { source: "FlowEngine.goToStage" });
            // safeGoToStage swallows the error, so the developer would not see it otherwise
            // eslint-disable-next-line no-console
            console.error("[Components-Care] [FlowEngine]", error);
            throw error;
        }
        await submit({ ...options, submitToServer });
        setStage(nextStage);
    }, [submit]);
    const safeGoToStage = useCallback(async (nextStage, submitToServer, options) => {
        try {
            await goToStage(nextStage, submitToServer, options);
            return true;
        }
        catch {
            // ignore, error is shown regardless
            return false;
        }
    }, [goToStage]);
    const context = useMemo(() => ({
        goToStage,
        safeGoToStage,
        stage,
    }), [goToStage, safeGoToStage, stage]);
    // after a stage change: the old stage's elements are gone, and with them the focus of
    // the button that changed the stage. A layout effect, so it runs before the browser paints
    // the old scroll position and before a dialog's focus trap takes the focus back, and after
    // the new stage's autoFocus.
    const rootRef = useRef(null);
    const shownStage = useRef(stage);
    useLayoutEffect(() => {
        if (shownStage.current === stage)
            return;
        shownStage.current = stage;
        const root = rootRef.current;
        if (disableAutoFocus || !root)
            return;
        const active = root.ownerDocument.activeElement;
        // the focus fell to the page or to a container around the flow (a dialog's); focus
        // in the new stage or elsewhere outside the flow stays where it is
        if (active && !active.contains(root))
            return;
        root.focus({ preventScroll: true });
        if (isStartScrolledAway(root))
            root.scrollIntoView({ block: "start" });
    }, [stage, disableAutoFocus]);
    const StageComp = getStageComponent(children, stage);
    if (!StageComp)
        throw unknownStageError(stage);
    const stageLabel = stageLabels?.[stage];
    return (_jsx(FlowStageContext.Provider, { value: context, children: _jsx(FlowEngineRoot, { ref: rootRef, tabIndex: -1, role: stageLabel ? "group" : undefined, "aria-label": stageLabel, children: _jsx(StageComp, { formProps: formProps, goToStage: goToStage, safeGoToStage: safeGoToStage, stage: stage }) }) }));
};
export default React.memo(FlowEngine);
