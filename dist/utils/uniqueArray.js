/**
 * Gets the uniq elements from given array
 * @param array The array object
 */
const uniqueArray = (array) => {
    return array.filter((item, pos) => {
        return array.indexOf(item) === pos;
    });
};
export const isUniqueArray = (array) => {
    return (array.find((item, pos) => {
        return array.indexOf(item) !== pos;
    }) == null);
};
export default uniqueArray;
