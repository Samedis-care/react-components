import { jsx as _jsx } from "react/jsx-runtime";
import { FormContext, FormContextLite } from "./Form";
const UnsetFormContext = (props) => {
    return (_jsx(FormContext.Provider, { value: null, children: _jsx(FormContextLite.Provider, { value: null, children: props.children }) }));
};
export default UnsetFormContext;
