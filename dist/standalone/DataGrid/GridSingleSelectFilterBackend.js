import React, { useEffect, useMemo } from "react";
import { FormControl, Grid, styled, useThemeProps } from "@mui/material";
import { useCustomFilterActiveContext } from "./Header/FilterBar";
import { useDataGridProps } from "./DataGrid";
import BackendSingleSelect from "../../backend-components/Selector/BackendSingleSelect";
const GridSingleSelectFilterBackendDialogRoot = styled(Grid, {
    name: "CcGridSingleSelectFilterBackend",
    slot: "dialogRoot",
})({});
const GridSingleSelectFilterBackendBarRoot = styled(Grid, {
    name: "CcGridSingleSelectFilterBackend",
    slot: "barRoot",
})({});
export const DataGridCustomFilterSingleBackend = styled(BackendSingleSelect, {
    name: "CcDataGrid",
    slot: "customFilterSingleBackend",
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
const GridSingleSelectFilterBackend = (inProps) => {
    const props = useThemeProps({
        props: inProps,
        name: "CcGridSingleSelectFilterBackend",
    });
    const { label, dialog, dialogBreakpoints, barBreakpoints, ...selectorProps } = props;
    const { selected } = selectorProps;
    const { classes } = useDataGridProps();
    const isActive = !!selected;
    const [, setActiveFilter] = useCustomFilterActiveContext();
    useEffect(() => {
        if (!isActive)
            return;
        setActiveFilter((prev) => prev + 1);
        return () => {
            setActiveFilter((prev) => prev - 1);
        };
    }, [setActiveFilter, isActive]);
    const selectorStyles = useMemo(() => ({
        autocomplete: isActive ? "Mui-active" : undefined,
    }), [isActive]);
    if (dialog) {
        return (React.createElement(GridSingleSelectFilterBackendDialogRoot, { size: { xs: 12, md: 6, lg: 3, ...dialogBreakpoints } },
            React.createElement(FormControl, { component: "fieldset", fullWidth: true },
                React.createElement(DataGridCustomFilterSingleBackend, { label: label, ...selectorProps, disableClearable: true, classes: selectorStyles, className: classes?.customFilterSingle }))));
    }
    else {
        return (React.createElement(GridSingleSelectFilterBackendBarRoot, { size: { xs: 4, ...barBreakpoints } },
            React.createElement(FormControl, { component: "fieldset", fullWidth: true },
                React.createElement(DataGridCustomFilterSingleBackend, { label: label, ...selectorProps, disableClearable: true, classes: selectorStyles, className: classes?.customFilterSingle }))));
    }
};
export default React.memo(GridSingleSelectFilterBackend);
