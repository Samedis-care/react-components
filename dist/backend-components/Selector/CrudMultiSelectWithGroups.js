import React from "react";
import { Loader } from "../../standalone";
import BackendMultiSelectWithTags from "./BackendMultiSelectWithTags";
import useCrudSelect from "./useCrudSelect";
const CrudMultiSelectWithGroups = (props, ref) => {
    const { errorComponent: ErrorComponent } = props;
    const { loading, error, loadError, selected, initialRawData, handleSelect, modelToSelectorData, } = useCrudSelect(props, ref);
    if (loading)
        return React.createElement(Loader, null);
    if (loadError)
        return React.createElement("span", null, loadError.message);
    return (React.createElement(React.Fragment, null,
        error && React.createElement(ErrorComponent, { error: error }),
        React.createElement(BackendMultiSelectWithTags, { ...props, selected: selected.map((entry) => entry.value), onChange: handleSelect, convData: modelToSelectorData, initialData: initialRawData })));
};
export default React.memo(React.forwardRef(CrudMultiSelectWithGroups));
