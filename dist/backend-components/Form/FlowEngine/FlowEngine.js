import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useMemo, useState } from "react";
import { useFormContextLite } from "../Form";
export const FlowStageContext = React.createContext(null);
export const useFlowStageContext = () => {
    const ctx = useContext(FlowStageContext);
    if (!ctx)
        throw new Error("FlowStageContext not set");
    return ctx;
};
const FlowEngine = (props) => {
    const { defaultStage, formProps, children } = props;
    const [stage, setStage] = useState(defaultStage);
    const { flowEngine, submit } = useFormContextLite();
    if (!flowEngine)
        throw new Error("Form not configured for flowEngine");
    const goToStage = useCallback(async (nextStage, submitToServer) => {
        await submit({ submitToServer });
        setStage(nextStage);
    }, [submit]);
    const safeGoToStage = useCallback(async (nextStage, submitToServer) => {
        try {
            await goToStage(nextStage, submitToServer);
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
    const StageComp = children[stage];
    return (_jsx(FlowStageContext.Provider, { value: context, children: _jsx(StageComp, { formProps: formProps, goToStage: goToStage, safeGoToStage: safeGoToStage, stage: stage }) }));
};
export default React.memo(FlowEngine);
