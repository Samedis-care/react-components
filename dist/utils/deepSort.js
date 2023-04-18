import isPlainObject from "./isPlainObject";
var deepSort = function (data) {
    if (!isPlainObject(data))
        return data;
    var newData = {};
    Object.entries(data)
        .sort(function (a, b) { return a[0].localeCompare(b[0]); })
        .forEach(function (_a) {
        var k = _a[0], v = _a[1];
        newData[k] = deepSort(v);
    });
    return newData;
};
export default deepSort;
