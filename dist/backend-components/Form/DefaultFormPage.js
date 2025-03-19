import React, { useMemo } from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
const DefaultFormPage = (props) => {
    const { children, extraButtons, textButtonSave, textButtonBack } = props;
    const childrenProps = useMemo(() => ({ extraButtons, textButtonSave, textButtonBack }), [extraButtons, textButtonSave, textButtonBack]);
    return (React.createElement(BasicFormPage, { ...props, form: children, childrenProps: childrenProps }, DefaultFormPageButtons));
};
export default React.memo(DefaultFormPage);
