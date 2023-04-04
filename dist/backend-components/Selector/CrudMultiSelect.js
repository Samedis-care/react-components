var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React, { useContext } from "react";
import { Loader } from "../../standalone";
import { BackendMultiSelect } from "./index";
import useCrudSelect from "./useCrudSelect";
import { DialogContextProvider } from "../../framework";
export var CrudSelectContext = React.createContext(undefined);
export var useCrudSelectContext = function () {
    var ctx = useContext(CrudSelectContext);
    if (!ctx)
        throw new Error("CrudSelectContext not set");
    return ctx;
};
var CrudMultiSelect = function (props, ref) {
    var ErrorComponent = props.errorComponent;
    var crudSelect = useCrudSelect(props, ref);
    var loading = crudSelect.loading, error = crudSelect.error, loadError = crudSelect.loadError, selected = crudSelect.selected, initialRawData = crudSelect.initialRawData, handleSelect = crudSelect.handleSelect, modelToSelectorData = crudSelect.modelToSelectorData;
    if (loading)
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    return (React.createElement(CrudSelectContext.Provider, { value: crudSelect },
        React.createElement(DialogContextProvider
        // for creating dialogs inside end adornment of selector with access to selector data
        , null,
            error && React.createElement(ErrorComponent, { error: error }),
            React.createElement(BackendMultiSelect, __assign({}, props, { selected: selected.map(function (entry) { return entry.value; }), onSelect: handleSelect, modelToSelectorData: modelToSelectorData, initialData: initialRawData })))));
};
export default React.memo(React.forwardRef(CrudMultiSelect));
