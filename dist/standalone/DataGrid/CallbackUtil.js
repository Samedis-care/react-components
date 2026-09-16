export const dataGridPrepareFiltersAndSorts = (columnsState) => {
    const baseSorts = [];
    const fieldFilter = {};
    Object.keys(columnsState).forEach((field) => {
        if (!Object.prototype.hasOwnProperty.call(columnsState, field))
            return;
        if (columnsState[field].sort !== 0) {
            baseSorts.push({
                field,
                ...columnsState[field],
            });
        }
        const filter = columnsState[field].filter;
        if (filter && filter.value1) {
            fieldFilter[field] = filter;
        }
    });
    const sorts = baseSorts
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((col) => ({ field: col.field, direction: col.sort }));
    return [sorts, fieldFilter];
};
/**
 * Applies a manual row update to the grid state
 * @param state The current grid state
 * @param id The ID of the row to update
 * @param update The changed fields, or a function which gets the current row
 *               data and returns the changed fields
 * @returns The new grid state, or the passed state if the row isn't loaded
 * @remarks The row ID can't be changed
 */
export const dataGridApplyRowUpdate = (state, id, update) => {
    const entry = Object.entries(state.rows).find(([, row]) => row.id === id);
    if (!entry)
        return state;
    const [index, row] = entry;
    const changes = typeof update === "function" ? update(row) : update;
    return {
        ...state,
        rows: {
            ...state.rows,
            [Number(index)]: { ...row, ...changes, id: row.id },
        },
    };
};
