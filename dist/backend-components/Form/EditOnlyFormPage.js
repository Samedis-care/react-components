import React from "react";
import { BasicFormPage, DefaultFormPageButtons } from "./index";
const EditOnlyFormPage = (props) => {
    const { children } = props;
    return (React.createElement(BasicFormPage, { ...props, form: children, childrenProps: undefined }, DefaultFormPageButtons));
};
export default React.memo(EditOnlyFormPage);
