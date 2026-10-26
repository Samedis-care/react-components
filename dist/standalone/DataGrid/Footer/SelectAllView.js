import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { DataGridSelectAllCheckbox, useDataGridProps } from "../DataGrid";
const SelectAllView = (props) => {
    const { classes } = useDataGridProps();
    const { busy, label } = props;
    const slotProps = useMemo(() => busy || label
        ? { input: { "aria-busy": busy || undefined, "aria-label": label } }
        : undefined, [busy, label]);
    return (_jsx(DataGridSelectAllCheckbox, { className: classes?.selectAllCheckbox, checked: props.checked, indeterminate: props.indeterminate, onChange: props.onSelect, disabled: props.disabled, slotProps: slotProps }));
};
export default React.memo(SelectAllView);
