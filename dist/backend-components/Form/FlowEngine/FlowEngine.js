import React, { useCallback, useState } from "react";
import { useFormContextLite } from "../Form";
const FlowEngine = (props) => {
    const { defaultStage, formProps, children } = props;
    const [stage, setStage] = useState(defaultStage);
    const { flowEngine, submit } = useFormContextLite();
    if (!flowEngine)
        throw new Error("Form not configured for flowEngine");
    const goToStage = useCallback(async (nextStage, submitToServer) => {
        try {
            await submit({ submitToServer });
        }
        catch (e) {
            // validation error, shown to user via ErrorComponent
        }
        setStage(nextStage);
    }, [submit]);
    const StageComp = children[stage];
    return React.createElement(StageComp, { formProps: formProps, goToStage: goToStage });
};
export default React.memo(FlowEngine);
