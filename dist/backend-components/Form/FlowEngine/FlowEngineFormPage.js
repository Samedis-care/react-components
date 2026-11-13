import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import BasicFormPage from "../BasicFormPage";
import FlowEngineFormPageButtons from "./FlowEngineFormPageButtons";
const NO_FOOTER_PROPS = {};
const FlowEngineFormPage = (props) => {
    const { children } = props;
    return (_jsx(BasicFormPage, { ...props, form: children, childrenProps: NO_FOOTER_PROPS, children: FlowEngineFormPageButtons }));
};
export default React.memo(FlowEngineFormPage);
