import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
const DefaultFormPage = (props) => {
    const { children, extraButtons, textButtonSave, textButtonBack } = props;
    const childrenProps = useMemo(() => ({ extraButtons, textButtonSave, textButtonBack }), [extraButtons, textButtonSave, textButtonBack]);
    return (_jsx(BasicFormPage, { ...props, form: children, childrenProps: childrenProps, children: DefaultFormPageButtons }));
};
export default React.memo(DefaultFormPage);
