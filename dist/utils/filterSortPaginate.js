var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Applies the given filters, sort and offset-based pagination settings to the given data.
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 */
export var filterSortPaginate2 = function (rowData, params, columnDef) {
    var offset = params.offset, amountRows = params.rows, quickFilter = params.quickFilter, fieldFilter = params.fieldFilter, sort = params.sort;
    // quickfilter
    if (quickFilter) {
        rowData = rowData.filter(function (row) {
            for (var key in row) {
                if (!Object.prototype.hasOwnProperty.call(row, key))
                    continue;
                var value = row[key];
                if (value !== null &&
                    value.toString().toLowerCase().includes(quickFilter.toLowerCase())) {
                    return true;
                }
            }
            return false;
        });
    }
    var _loop_1 = function (filterField) {
        if (!Object.prototype.hasOwnProperty.call(fieldFilter, filterField)) {
            return "continue";
        }
        var filter = fieldFilter[filterField];
        var column = columnDef.find(function (e) { return e.field === filterField; });
        if (!column)
            throw new Error("Non-null assertion failed");
        var filterCache = {};
        var filterIndex = 0;
        var expr = "";
        while (filter) {
            filter.value1 = filter.value1.toLowerCase();
            filter.value2 = filter.value2.toLowerCase();
            filterIndex++;
            var filterKey = filterIndex.toString();
            filterCache[filterKey] = filter;
            switch (filter.type) {
                case "contains":
                    expr += 'value.includes(filterCache["' + filterKey + '"].value1)';
                    break;
                case "notContains":
                    expr += '!value.includes(filterCache["' + filterKey + '"].value1)';
                    break;
                case "equals":
                    if (column.type === "number") {
                        expr +=
                            'parseInt(value) === parseInt(filterCache["' +
                                filterKey +
                                '"].value1)';
                    }
                    else {
                        expr += 'value === filterCache["' + filterKey + '"].value1';
                    }
                    break;
                case "notEqual":
                    if (column.type === "number") {
                        expr +=
                            'parseInt(value) !== parseInt(filterCache["' +
                                filterKey +
                                '"].value1)';
                    }
                    else {
                        expr += 'value !== filterCache["' + filterKey + '"].value1';
                    }
                    break;
                case "notEmpty":
                    expr += "value !== ''";
                    break;
                case "empty":
                    expr += "value === ''";
                    break;
                case "startsWith":
                    expr += 'value.startsWith(filterCache["' + filterKey + '"].value1)';
                    break;
                case "endsWith":
                    expr += 'value.endsWith(filterCache["' + filterKey + '"].value1)';
                    break;
                case "lessThan":
                    expr +=
                        'parseInt(value) < parseInt(filterCache["' +
                            filterKey +
                            '"].value1)';
                    break;
                case "lessThanOrEqual":
                    expr +=
                        'parseInt(value) <= parseInt(filterCache["' +
                            filterKey +
                            '"].value1)';
                    break;
                case "greaterThan":
                    expr +=
                        'parseInt(value) > parseInt(filterCache["' +
                            filterKey +
                            '"].value1)';
                    break;
                case "greaterThanOrEqual":
                    expr +=
                        'parseInt(value) >= parseInt(filterCache["' +
                            filterKey +
                            '"].value1)';
                    break;
                case "inRange":
                    expr +=
                        'parseInt(value) >= parseInt(filterCache["' +
                            filterKey +
                            '"].value1) && parseInt(value) <= parseInt(filterCache["' +
                            filterKey +
                            '"].value2)';
                    break;
                case "inSet":
                    expr +=
                        'filterCache["' +
                            filterKey +
                            '"].value1.split(",").includes(value)';
                    break;
                case "notInSet":
                    expr +=
                        '!filterCache["' +
                            filterKey +
                            '"].value1.split(",").includes(value)';
                    break;
            }
            filter = filter.nextFilter;
            if (filter && filter.value1)
                expr += filter.nextFilterType === "and" ? " && " : " || ";
            else
                break;
        }
        rowData = rowData.filter(function (row) {
            var rawValue = row[filterField];
            if (!rawValue)
                rawValue = "";
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            var value = rawValue.toString().toLowerCase();
            try {
                // eslint-disable-next-line no-eval
                return !expr || eval(expr);
            }
            catch (e) {
                // eslint-disable-next-line no-console
                console.error("[Components-Care] [DataGrid] Filter error:", e);
                return false;
            }
        });
    };
    // field filter
    for (var filterField in fieldFilter) {
        _loop_1(filterField);
    }
    // sort
    rowData.sort(function (a, b) {
        for (var _i = 0, sort_1 = sort; _i < sort_1.length; _i++) {
            var sorter = sort_1[_i];
            var valA = a[sorter.field];
            var valB = b[sorter.field];
            var res = 0;
            if (typeof valA === "number" && typeof valB === "number") {
                res = valA - valB;
            }
            else if (valA && valB) {
                var av = valA.toString();
                var bv = valB.toString();
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
    var filteredRows = rowData.length;
    return [__spreadArray([], rowData, true).splice(offset, amountRows), filteredRows];
};
/**
 * Applies the given filters, sort and pagination settings to the given data
 * @param rowData The data to filter, sort and paginate
 * @param params The filter, sort and pagination settings
 * @param columnDef Metadata about the columns
 * @returns An array containing the filtered, sorted and paginated data in the first slot
 *          and the total amount of filtered rows before pagination in the second slot
 */
var filterSortPaginate = function (rowData, params, columnDef) {
    var offset = (params.page - 1) * params.rows;
    return filterSortPaginate2(rowData, __assign(__assign({}, params), { offset: offset }), columnDef);
};
export default filterSortPaginate;
