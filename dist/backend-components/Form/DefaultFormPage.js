import React, { useMemo } from "react";
import BasicFormPage from "./BasicFormPage";
import DefaultFormPageButtons from "./DefaultFormPageButtons";
const DefaultFormPage = (props) => {
    const { children, extraButtons } = props;
    const childrenProps = useMemo(() => ({ extraButtons }), [extraButtons]);
    return (React.createElement(BasicFormPage, { ...props, form: children, childrenProps: childrenProps }, DefaultFormPageButtons));
};
export default React.memo(DefaultFormPage);
