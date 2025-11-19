/**
 * Applies the given filters, sort and offset-based pagination settings to the given data.
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 */
export const filterSortPaginate2 = (rowData, params, columnDef) => {
    const { offset, rows: amountRows, quickFilter, fieldFilter, sort } = params;
    // quickfilter
    if (quickFilter) {
        rowData = rowData.filter((row) => {
            for (const key in row) {
                if (!Object.prototype.hasOwnProperty.call(row, key))
                    continue;
                const value = row[key];
                if (value != null &&
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value.toString().toLowerCase().includes(quickFilter.toLowerCase())) {
                    return true;
                }
            }
            return false;
        });
    }
    // field filter
    for (const filterField in fieldFilter) {
        if (!Object.prototype.hasOwnProperty.call(fieldFilter, filterField)) {
            continue;
        }
        let filter = fieldFilter[filterField];
        const column = columnDef.find((e) => e.field === filterField);
        if (!column)
            throw new Error("Non-null assertion failed");
        let lastNextFilterType = undefined;
        let finalExpr = () => true;
        while (filter) {
            const value1 = filter.value1.toLowerCase();
            const value2 = filter.value2.toLowerCase();
            let exprFn;
            switch (filter.type) {
                case "contains":
                    exprFn = (value) => value.includes(value1);
                    break;
                case "notContains":
                    exprFn = (value) => !value.includes(value1);
                    break;
                case "equals":
                    if (column.type === "number") {
                        exprFn = (value) => parseInt(value) === parseInt(value1);
                    }
                    else {
                        exprFn = (value) => value === value1;
                    }
                    break;
                case "notEqual":
                    if (column.type === "number") {
                        exprFn = (value) => parseInt(value) !== parseInt(value1);
                    }
                    else {
                        exprFn = (value) => value !== value1;
                    }
                    break;
                case "notEmpty":
                    exprFn = (value) => value !== "";
                    break;
                case "empty":
                    exprFn = (value) => value === "";
                    break;
                case "startsWith":
                    exprFn = (value) => value.startsWith(value1);
                    break;
                case "endsWith":
                    exprFn = (value) => value.endsWith(value1);
                    break;
                case "lessThan":
                    exprFn = (value) => parseInt(value) < parseInt(value1);
                    break;
                case "lessThanOrEqual":
                    exprFn = (value) => parseInt(value) <= parseInt(value1);
                    break;
                case "greaterThan":
                    exprFn = (value) => parseInt(value) > parseInt(value1);
                    break;
                case "greaterThanOrEqual":
                    exprFn = (value) => parseInt(value) >= parseInt(value1);
                    break;
                case "inRange":
                    exprFn = (value) => {
                        const vI = parseInt(value);
                        return vI >= parseInt(value1) && vI <= parseInt(value2);
                    };
                    break;
                case "inSet":
                    exprFn = (value) => value1.split(",").includes(value);
                    break;
                case "notInSet":
                    exprFn = (value) => !value1.split(",").includes(value);
                    break;
                default:
                    throw new Error("Unsupported filterType");
            }
            if (!lastNextFilterType) {
                finalExpr = exprFn;
            }
            else {
                const prevExpr = finalExpr;
                if (lastNextFilterType === "and") {
                    finalExpr = (value) => prevExpr(value) && exprFn(value);
                }
                else if (lastNextFilterType === "or") {
                    finalExpr = (value) => prevExpr(value) || exprFn(value);
                }
                else {
                    throw new Error("Unsupported nextFilterType");
                }
            }
            if (filter.nextFilter?.value1)
                lastNextFilterType = filter.nextFilterType;
            filter = filter.nextFilter;
        }
        rowData = rowData.filter((row) => {
            let rawValue = row[filterField];
            if (!rawValue)
                rawValue = "";
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            const value = rawValue.toString().toLowerCase();
            try {
                return finalExpr(value);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [DataGrid] Filter error:", e);
                return false;
            }
        });
    }
    // sort
    rowData.sort((a, b) => {
        for (const sorter of sort) {
            const valA = a[sorter.field];
            const valB = b[sorter.field];
            let res = 0;
            if (typeof valA === "number" && typeof valB === "number") {
                res = valA - valB;
            }
            else if (valA && valB) {
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                const av = valA.toString();
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                const bv = valB.toString();
                res = av.localeCompare(bv);
            }
            else {
                if (!valA && !valB)
                    res = 0;
                else if (!valA)
                    res = -1;
                else if (!valB)
                    res = 1;
            }
            res *= sorter.direction;
            if (res)
                return res;
        }
        return 0;
    });
    // pagination
    const filteredRows = rowData.length;
    return [[...rowData].splice(offset, amountRows), filteredRows];
};
/**
 * Applies the given filters, sort and pagination settings to the given data
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 */
const filterSortPaginate = (rowData, params, columnDef) => {
    const offset = (params.page - 1) * params.rows;
    return filterSortPaginate2(rowData, { ...params, offset }, columnDef);
};
export default filterSortPaginate;
