import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { forwardRef, useContext, } from "react";
import BackendMultiSelect from "./BackendMultiSelect";
import useCrudSelect from "./useCrudSelect";
import DialogContextProvider from "../../framework/DialogContextProvider";
import CrudSelectLoadState from "./CrudSelectLoadState";
export const CrudSelectContext = React.createContext(undefined);
export const useCrudSelectContext = () => {
    const ctx = useContext(CrudSelectContext);
    if (!ctx)
        throw new Error("CrudSelectContext not set");
    return ctx;
};
const CrudMultiSelect = (props, ref) => {
    const { errorComponent: ErrorComponent } = props;
    // a read-only control writes nothing either
    const crudSelect = useCrudSelect({ ...props, blockWrites: props.blockWrites || props.readOnly }, ref);
    const { loading, error, loadError, selected, initialRawData, handleSelect, modelToSelectorData, } = crudSelect;
    // until the selection is loaded nothing can be picked or removed, and the components
    // inside the field, which work on the selection, are not rendered
    const locked = loading || !!loadError;
    return (_jsx(CrudSelectContext.Provider, { value: crudSelect, children: _jsxs(DialogContextProvider
        // for creating dialogs inside end adornment of selector with access to selector data
        , { children: [error && _jsx(ErrorComponent, { error: error }), _jsx("div", { "aria-busy": loading, children: _jsx(BackendMultiSelect, { ...props, disabled: props.disabled || locked, 
                        // until the selection is loaded there is nothing to list
                        readOnly: props.readOnly && !locked, endAdornment: locked ? undefined : props.endAdornment, endAdornmentLeft: locked ? undefined : props.endAdornmentLeft, selected: selected.map((entry) => entry.value), onSelect: handleSelect, modelToSelectorData: modelToSelectorData, 
                        // the connector's records seed the selected cache: modelToSelectorData tells them apart
                        initialData: initialRawData }) }), _jsx(CrudSelectLoadState, { loading: loading, loadError: loadError, label: props.label })] }) }));
};
const ForwardedCrudMultiSelect = forwardRef(CrudMultiSelect);
const MemoizedCrudMultiSelect = React.memo(ForwardedCrudMultiSelect);
export default MemoizedCrudMultiSelect;
