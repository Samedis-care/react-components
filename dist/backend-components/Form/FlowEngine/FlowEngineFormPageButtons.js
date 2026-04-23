import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { FormButtons } from "../../../standalone";
const FlowEngineFormPageButtons = (props) => {
    return _jsx(FormButtons, { children: props.customProps.buttons });
};
export default React.memo(FlowEngineFormPageButtons);
