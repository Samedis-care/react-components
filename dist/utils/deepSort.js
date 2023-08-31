import isPlainObject from "./isPlainObject";
const deepSort = (data) => {
    if (!isPlainObject(data))
        return data;
    const newData = {};
    Object.entries(data)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([k, v]) => {
        newData[k] = deepSort(v);
    });
    return newData;
};
export default deepSort;
