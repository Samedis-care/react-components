import React, { useEffect, useMemo } from "react";
import { Grid2 as Grid, styled, useThemeProps } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import BackendMultipleSelect from "../../backend-components/Selector/BackendMultipleSelect";
import BackendMultiSelect from "../../backend-components/Selector/BackendMultiSelect";
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
    const [, setActiveFilter] = useCustomFilterActiveContext();
    useEffect(() => {
        if (!isActive)
            return;
        setActiveFilter((prev) => prev + 1);
        return () => {
            setActiveFilter((prev) => prev - 1);
        };
    }, [setActiveFilter, isActive]);
    const selectorClasses = useMemo(() => ({
        autocomplete: isActive ? "Mui-active" : undefined,
    }), [isActive]);
    if (dialog) {
        return (React.createElement(GridMultiSelectFilterDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints } },
            React.createElement(Grid, { container: true },
                React.createElement(BackendMultiSelect, { confirmDelete: false, ...selectorProps, selected: selected }))));
    }
    else {
        return (React.createElement(GridMultiSelectFilterBarRoot, { size: { xs: 4, ...barBreakpoints } },
            React.createElement(DataGridCustomFilterMultiBackend, { ...selectorProps, classes: selectorClasses, className: classes?.customFilterMulti, selected: selected })));
    }
};
export default React.memo(GridMultiSelectFilterBackend);
