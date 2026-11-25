import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import BackendMultiSelectWithTags from "./BackendMultiSelectWithTags";
import useCrudSelect from "./useCrudSelect";
import CrudSelectLoadState from "./CrudSelectLoadState";
const CrudMultiSelectWithGroups = (props, ref) => {
    const { errorComponent: ErrorComponent } = props;
    const { loading, error, loadError, selected, added, removed, pendingChanges, initialRawData, handleSelect, modelToSelectorData, } = useCrudSelect(props, ref);
    // an explicit prop wins, as over the other states the field takes from its props
    const dirty = props.dirty ?? (props.showDirtyState ? pendingChanges : undefined);
    // until the selection is loaded nothing can be picked or removed
    const locked = loading || !!loadError;
    return (_jsxs(_Fragment, { children: [error && _jsx(ErrorComponent, { error: error }), _jsx("div", { "aria-busy": loading, children: _jsx(BackendMultiSelectWithTags, { ...props, disabled: props.disabled || locked, selected: selected.map((entry) => entry.value), added: added, removed: removed, dirty: dirty, onChange: handleSelect, convData: modelToSelectorData, 
                    // the connector's records seed the selected cache: modelToSelectorData tells them apart
                    initialData: initialRawData }) }), _jsx(CrudSelectLoadState, { loading: loading, loadError: loadError, label: props.title })] }));
};
const ForwardedCrudMultiSelectWithGroups = React.forwardRef(CrudMultiSelectWithGroups);
export default React.memo(ForwardedCrudMultiSelectWithGroups);
