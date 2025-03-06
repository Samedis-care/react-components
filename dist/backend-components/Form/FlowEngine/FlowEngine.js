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
    const context = useMemo(() => ({
        goToStage,
        stage,
    }), [goToStage, stage]);
    const StageComp = children[stage];
    return (React.createElement(FlowStageContext.Provider, { value: context },
        React.createElement(StageComp, { formProps: formProps, goToStage: goToStage, stage: stage })));
};
export default React.memo(FlowEngine);
