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
