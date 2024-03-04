import React, { useContext } from "react";
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
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    return (React.createElement(CrudSelectContext.Provider, { value: crudSelect },
        React.createElement(DialogContextProvider
        // for creating dialogs inside end adornment of selector with access to selector data
        , null,
            error && React.createElement(ErrorComponent, { error: error }),
            React.createElement(BackendMultiSelect, { ...props, selected: selected.map((entry) => entry.value), onSelect: handleSelect, modelToSelectorData: modelToSelectorData, initialData: initialRawData }))));
};
export default React.memo(React.forwardRef(CrudMultiSelect));
