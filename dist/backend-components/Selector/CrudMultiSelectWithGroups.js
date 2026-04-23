import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Loader } from "../../standalone";
import BackendMultiSelectWithTags from "./BackendMultiSelectWithTags";
import useCrudSelect from "./useCrudSelect";
const CrudMultiSelectWithGroups = (props, ref) => {
    const { errorComponent: ErrorComponent } = props;
    const { loading, error, loadError, selected, initialRawData, handleSelect, modelToSelectorData, } = useCrudSelect(props, ref);
    if (loading)
        return _jsx(Loader, {});
    if (loadError)
        return _jsx("span", { children: loadError.message });
    return (_jsxs(_Fragment, { children: [error && _jsx(ErrorComponent, { error: error }), _jsx(BackendMultiSelectWithTags, { ...props, selected: selected.map((entry) => entry.value), onChange: handleSelect, convData: modelToSelectorData, initialData: initialRawData })] }));
};
const ForwardedCrudMultiSelectWithGroups = React.forwardRef(CrudMultiSelectWithGroups);
export default React.memo(ForwardedCrudMultiSelectWithGroups);
