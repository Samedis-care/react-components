import React from "react";
import { FormButtons } from "../../../standalone";
const FlowEngineFormPageButtons = (props) => {
    return React.createElement(FormButtons, null, props.customProps.buttons);
};
export default React.memo(FlowEngineFormPageButtons);
