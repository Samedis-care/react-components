import React from "react";
import { FormContext, FormContextLite } from "./Form";
const UnsetFormContext = (props) => {
    return (React.createElement(FormContext.Provider, { value: null },
        React.createElement(FormContextLite.Provider, { value: null }, props.children)));
};
export default UnsetFormContext;
