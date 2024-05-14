import React from "react";
import BasicFormPage from "../BasicFormPage";
import FlowEngineFormPageButtons from "./FlowEngineFormPageButtons";
const FlowEngineFormPage = (props) => {
    const { children } = props;
    return (React.createElement(BasicFormPage, { ...props, form: children, childrenProps: undefined }, FlowEngineFormPageButtons));
};
export default React.memo(FlowEngineFormPage);
