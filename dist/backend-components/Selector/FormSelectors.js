import { jsx as _jsx } from "react/jsx-runtime";
import { useCallback } from "react";
import { useFormContextLite } from "../Form";
import BackendSingleSelect from "./BackendSingleSelect";
import BackendMultiSelect from "./BackendMultiSelect";
const WithSelectorFormContext = (SelectorComponent) => function WithSelectorFormContext(props) {
    const { onAddNew } = props;
    const { getFieldValues } = useFormContextLite();
    const handleAddNew = useCallback(() => {
        if (!onAddNew)
            return null;
        return onAddNew(getFieldValues());
    }, [getFieldValues, onAddNew]);
    // PropsT can be a union (the switch props), which the spread keeps apart; the cast
    // puts the form-aware onAddNew back in place
    const patchedProps = {
        ...props,
        onAddNew: onAddNew ? handleAddNew : undefined,
    };
    return _jsx(SelectorComponent, { ...patchedProps });
};
export const FormBackendSingleSelect = (props) => WithSelectorFormContext((BackendSingleSelect))(props);
export const FormBackendMultiSelect = (props) => WithSelectorFormContext((BackendMultiSelect))(props);
