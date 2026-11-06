import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Checkbox } from "@mui/material";
/**
 * A "Visible" or "Pin" checkbox of the column settings table, named by its
 * table column and row headers
 */
const SettingsCheckbox = (props) => {
    const { field, checked, disabled, onChange, labelledBy, describedBy } = props;
    const slotProps = useMemo(() => ({
        input: {
            "aria-labelledby": labelledBy,
            "aria-describedby": describedBy,
        },
    }), [labelledBy, describedBy]);
    return (_jsx(Checkbox, { checked: checked, disabled: disabled, onChange: onChange, value: field, slotProps: slotProps }));
};
export default React.memo(SettingsCheckbox);
