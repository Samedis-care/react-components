import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { Grid, styled, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useDataGridProps } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
const DataGridFilterCombinator = styled(ToggleButtonGroup, {
    name: "CcDataGrid",
    slot: "filterCombinator",
})({});
/**
 * The choice between AND and OR that joins two conditions of a column filter
 * chain (FilterEntry). It is a group of two toggle buttons named "Combine
 * conditions", of which one is pressed; a click on a word picks that word.
 * The group is one Tab stop: the arrow keys move the focus between the words,
 * and Space or Enter picks the focused one.
 * @internal
 */
const FilterCombinator = (props) => {
    const { value, onChange } = props;
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const handleChange = useCallback((_evt, newValue) => {
        // MUI reports a click on the pressed button as null; it stays pressed
        if (newValue === null)
            return;
        onChange(newValue);
    }, [onChange]);
    return (_jsx(Grid, { size: 12, children: _jsxs(DataGridFilterCombinator, { exclusive: true, fullWidth: true, size: "small", "aria-label": t("standalone.data-grid.content.filter-combination.label"), value: value, onChange: handleChange, className: classes?.filterCombinator, children: [_jsx(ToggleButton, { value: "and", children: t("standalone.data-grid.content.filter-combination.and") }), _jsx(ToggleButton, { value: "or", children: t("standalone.data-grid.content.filter-combination.or") })] }) }));
};
export default React.memo(FilterCombinator);
