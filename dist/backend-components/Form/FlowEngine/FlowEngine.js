import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef, useState, } from "react";
import { styled, useThemeProps } from "@mui/material";
import { useFormContextLite } from "../Form";
export const FlowStageContext = React.createContext(null);
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
const FlowEngine = (inProps) => {
    const props = useThemeProps({ props: inProps, name: "CcFlowEngine" });
    const { defaultStage, formProps, children, stageLabels, disableAutoFocus } = props;
    const [stage, setStage] = useState(defaultStage);
    const { flowEngine, submit } = useFormContextLite();
    if (!flowEngine)
        throw new Error("Form not configured for flowEngine");
    const goToStage = useCallback(async (nextStage, submitToServer, options) => {
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
    const StageComp = children[stage];
    const stageLabel = stageLabels?.[stage];
    return (_jsx(FlowStageContext.Provider, { value: context, children: _jsx(FlowEngineRoot, { ref: rootRef, tabIndex: -1, role: stageLabel ? "group" : undefined, "aria-label": stageLabel, children: _jsx(StageComp, { formProps: formProps, goToStage: goToStage, safeGoToStage: safeGoToStage, stage: stage }) }) }));
};
export default React.memo(FlowEngine);
