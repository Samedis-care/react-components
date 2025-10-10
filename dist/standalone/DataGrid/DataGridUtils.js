import { useCallback, useMemo } from "react";
import { getDataGridDefaultColumnsState, getDataGridDefaultState, useDataGridColumnState, useDataGridProps, useDataGridState, } from "./DataGrid";
import { deepEqual } from "../../utils";
export const useDataGridFiltersActive = () => {
    const [state] = useDataGridState();
    const [columnState] = useDataGridColumnState();
    const { columns, defaultSort, defaultFilter, defaultCustomData } = useDataGridProps();
    return useMemo(() => {
        const defaultState = getDataGridDefaultState(columns, defaultCustomData);
        const defaultColumnState = getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter);
        return (state.search !== defaultState.search ||
            !deepEqual(state.customData, defaultState.customData) ||
            Object.entries(columnState).some(([key, value]) => !deepEqual(value.filter ?? {}, defaultColumnState[key]?.filter ?? {})));
    }, [
        columnState,
        columns,
        defaultCustomData,
        defaultFilter,
        defaultSort,
        state.customData,
        state.search,
    ]);
};
export const useDataGridResetFilters = () => {
    const [, setState] = useDataGridState();
    const [, setColumnState] = useDataGridColumnState();
    const { columns, defaultSort, defaultFilter, defaultCustomData } = useDataGridProps();
    return useCallback(() => {
        const defaultState = getDataGridDefaultState(columns, defaultCustomData);
        const defaultColumnState = getDataGridDefaultColumnsState(columns, defaultSort, defaultFilter);
        setState((state) => ({
            ...state,
            search: defaultState.search,
            customData: defaultState.customData,
        }));
        setColumnState((colState) => Object.fromEntries(Object.entries(colState).map(([field, def]) => [
            field,
            { ...def, filter: defaultColumnState[field]?.filter },
        ])));
    }, [
        columns,
        defaultCustomData,
        defaultFilter,
        defaultSort,
        setColumnState,
        setState,
    ]);
};
