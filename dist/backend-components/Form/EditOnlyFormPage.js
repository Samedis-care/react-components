import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
const EditOnlyFormPage = (props) => {
    const { children } = props;
    return (_jsx(BasicFormPage, { ...props, form: children, childrenProps: undefined, children: DefaultFormPageButtons }));
};
export default React.memo(EditOnlyFormPage);
