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
export var dataGridPrepareFiltersAndSorts = function (columnsState) {
    var baseSorts = [];
    var fieldFilter = {};
    Object.keys(columnsState).forEach(function (field) {
        if (!Object.prototype.hasOwnProperty.call(columnsState, field))
            return;
        if (columnsState[field].sort !== 0) {
            baseSorts.push(__assign({ field: field }, columnsState[field]));
        }
        var filter = columnsState[field].filter;
        if (filter && filter.value1) {
            fieldFilter[field] = filter;
        }
    });
    var sorts = baseSorts
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .sort(function (a, b) { return a.sortOrder - b.sortOrder; })
        .map(function (col) { return ({ field: col.field, direction: col.sort }); });
    return [sorts, fieldFilter];
};
