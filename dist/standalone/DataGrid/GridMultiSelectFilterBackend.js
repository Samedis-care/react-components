import { jsx as _jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Grid, styled, useThemeProps } from "@mui/material";
import { useDataGridProps } from "./DataGrid";
import BackendMultipleSelect from "../../backend-components/Selector/BackendMultipleSelect";
import BackendMultiSelect from "../../backend-components/Selector/BackendMultiSelect";
import useFilterPanelLists from "./CustomFilterDialog/useFilterPanelLists";
export const DataGridCustomFilterMultiBackend = styled(BackendMultipleSelect, {
    name: "CcDataGrid",
    slot: "customFilterMultiBackend",
})(({ theme }) => ({
    "& .MuiAutocomplete-root.Mui-active": {
        borderColor: theme.palette.secondary.main,
        "& > fieldset": {
            borderColor: theme.palette.secondary.main,
        },
        "& .MuiAutocomplete-inputRoot": {
            borderColor: theme.palette.secondary.main,
            "& > fieldset": {
                borderColor: theme.palette.secondary.main,
            },
        },
    },
}));
const GridMultiSelectFilterDialogRoot = styled(Grid, {
    name: "CcGridMultiSelectFilter",
    slot: "dialogRoot",
})({});
const GridMultiSelectFilterBarRoot = styled(Grid, {
    name: "CcGridMultiSelectFilter",
    slot: "barRoot",
})({});
const EMPTY_STRING_ARRAY = [];
const GridMultiSelectFilterBackend = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcGridMultiSelectFilterBackend",
    });
    const { dialog, dialogBreakpoints, barBreakpoints, ...selectorProps } = props;
    const selected = selectorProps.selected ?? EMPTY_STRING_ARRAY;
    const { classes } = useDataGridProps();
    const isActive = selected.length > 0;
    const showList = useFilterPanelLists(dialog);
    const selectorClasses = useMemo(() => ({
        autocomplete: isActive ? "Mui-active" : undefined,
    }), [isActive]);
    if (showList) {
        return (_jsx(GridMultiSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints }, children: _jsx(Grid, { container: true, children: _jsx(BackendMultiSelect, { confirmDelete: false, ...selectorProps, selected: selected }) }) }));
    }
    // the bar's selector, also in the panel on a phone
    const selector = (_jsx(DataGridCustomFilterMultiBackend, { ...selectorProps, classes: selectorClasses, className: classes?.customFilterMulti, selected: selected }));
    return dialog ? (_jsx(GridMultiSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints }, children: selector })) : (_jsx(GridMultiSelectFilterBarRoot, { size: { xs: 4, ...barBreakpoints }, children: selector }));
};
export default React.memo(GridMultiSelectFilterBackend);
