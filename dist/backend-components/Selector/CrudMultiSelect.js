import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { forwardRef, useContext, } from "react";
import { Loader } from "../../standalone";
import BackendMultiSelect from "./BackendMultiSelect";
import useCrudSelect from "./useCrudSelect";
import DialogContextProvider from "../../framework/DialogContextProvider";
export const CrudSelectContext = React.createContext(undefined);
export const useCrudSelectContext = () => {
    const ctx = useContext(CrudSelectContext);
    if (!ctx)
        throw new Error("CrudSelectContext not set");
    return ctx;
};
const CrudMultiSelect = (props, ref) => {
    const { errorComponent: ErrorComponent } = props;
    const crudSelect = useCrudSelect(props, ref);
    const { loading, error, loadError, selected, initialRawData, handleSelect, modelToSelectorData, } = crudSelect;
    if (loading)
        return _jsx(Loader, {});
    if (loadError)
        return _jsx("span", { children: loadError.message });
    return (_jsx(CrudSelectContext.Provider, { value: crudSelect, children: _jsxs(DialogContextProvider
        // for creating dialogs inside end adornment of selector with access to selector data
        , { children: [error && _jsx(ErrorComponent, { error: error }), _jsx(BackendMultiSelect, { ...props, selected: selected.map((entry) => entry.value), onSelect: handleSelect, modelToSelectorData: modelToSelectorData, initialData: initialRawData })] }) }));
};
const ForwardedCrudMultiSelect = forwardRef(CrudMultiSelect);
const MemoizedCrudMultiSelect = React.memo(ForwardedCrudMultiSelect);
export default MemoizedCrudMultiSelect;
