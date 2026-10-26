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
 * The filter the grid shows, as loadData gets it
 * @param state The grid state (its search and custom data)
 * @param columnsState The column state (its filters)
 * @param getAdditionalFilters The grid's getAdditionalFilters
 * @remarks Without getAdditionalFilters, the custom data are the additional filters
 */
export const dataGridGetFilterParameters = (state, columnsState, getAdditionalFilters) => ({
    quickFilter: state.search,
    additionalFilters: getAdditionalFilters
        ? getAdditionalFilters(state.customData)
        : state.customData,
    fieldFilter: dataGridPrepareFiltersAndSorts(columnsState)[1],
});
/**
 * The query the grid shows, as loadData gets it (without the paging)
 * @param state The grid state (its search and custom data)
 * @param columnsState The column state (its filters and sorts)
 * @param getAdditionalFilters The grid's getAdditionalFilters
 * @see dataGridGetFilterParameters
 */
export const dataGridGetQuery = (state, columnsState, getAdditionalFilters) => ({
    ...dataGridGetFilterParameters(state, columnsState, getAdditionalFilters),
    sort: dataGridPrepareFiltersAndSorts(columnsState)[0],
});
/**
 * The first rows the query matches which can be selected, as the limited
 * select all selects them (DataGridProps.limitSelectAll)
 * @param loadData The grid's loadData, loads the pages the grid hasn't loaded
 * @param query The query the grid shows
 * @param rowsPerPage The grid's page size
 * @param rows The rows the grid has loaded (row index -> row)
 * @param limit How many rows to return at most
 * @param canSelectRow The grid's canSelectRow: the rows it refuses are skipped
 * @returns The rows and the pages loaded for them, rejects if loadData rejects
 * @remarks Loads one page after the other, until the limit is reached or a
 *          page with less than rowsPerPage rows (the last one) was read
 */
export const dataGridLoadFirstRows = async (loadData, query, rowsPerPage, rows, limit, canSelectRow) => {
    const selectable = [];
    const loadedRows = {};
    for (let page = 0; selectable.length < limit; page++) {
        const start = page * rowsPerPage;
        let pageRows;
        if (start in rows) {
            // the grid stores whole pages
            pageRows = [];
            const end = start + rowsPerPage;
            for (let index = start; index < end && index in rows; index++) {
                pageRows.push(rows[index]);
            }
        }
        else {
            pageRows = (await loadData({ page: page + 1, rows: rowsPerPage, ...query })).rows;
            pageRows.forEach((row, offset) => {
                loadedRows[start + offset] = row;
            });
        }
        for (const row of pageRows) {
            if (selectable.length >= limit)
                break;
            if (!canSelectRow || canSelectRow(row))
                selectable.push(row);
        }
        if (pageRows.length < rowsPerPage)
            break;
    }
    return { rows: selectable, loadedRows };
};
/**
 * Is a custom data action button disabled?
 * @param button The button
 * @param numSelected The amount of selected rows (0 none, 1 one, 2 multiple)
 * @param selectAll Is everything selected (the selection inverted)?
 */
export const dataGridIsCustomDataActionDisabled = (button, numSelected, selectAll) => (selectAll && !button.supportsSelectAll) || button.isDisabled(numSelected);
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
