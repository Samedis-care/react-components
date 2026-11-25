import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Checkbox, styled } from "@mui/material";
import focusRing from "../../../utils/internal/focusRing";
// MUI shows keyboard focus on a checkbox only as a faint ripple (unless the
// theme sets its focusVisible ring), which forced colors drop: the ring goes
// around the box, where MUI draws the theme's ring
const FocusRingCheckbox = styled(Checkbox)(({ theme }) => ({
    "&.Mui-focusVisible > svg": {
        borderRadius: theme.shape.borderRadius,
        ...focusRing(theme, 2),
    },
}));
/**
 * A "Visible" or "Pin" checkbox of the column settings table, named by its
 * table column and row headers. Keyboard focus shows a 2px outline in
 * `theme.palette.primary.main` around the box, or the ring of the theme's
 * `focusVisible` option when the theme sets one.
 */
const SettingsCheckbox = (props) => {
    const { field, checked, disabled, onChange, labelledBy, describedBy } = props;
    const slotProps = useMemo(() => ({
        input: {
            "aria-labelledby": labelledBy,
            "aria-describedby": describedBy,
        },
    }), [labelledBy, describedBy]);
    return (_jsx(FocusRingCheckbox, { checked: checked, disabled: disabled, onChange: onChange, value: field, slotProps: slotProps }));
};
export default React.memo(SettingsCheckbox);
