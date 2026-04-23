import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import BasicFormPage from "../BasicFormPage";
import FlowEngineFormPageButtons from "./FlowEngineFormPageButtons";
const FlowEngineFormPage = (props) => {
    const { children } = props;
    return (_jsx(BasicFormPage, { ...props, form: children, childrenProps: undefined, children: FlowEngineFormPageButtons }));
};
export default React.memo(FlowEngineFormPage);
