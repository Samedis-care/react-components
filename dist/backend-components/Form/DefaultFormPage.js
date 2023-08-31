import React from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
const DefaultFormPage = (props) => {
    const { children } = props;
    return (React.createElement(BasicFormPage, { ...props, form: children, childrenProps: undefined }, DefaultFormPageButtons));
};
export default React.memo(DefaultFormPage);
