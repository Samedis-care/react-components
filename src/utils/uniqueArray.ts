/**
 * Gets the uniq elements from given array
 * @param array The array object
 */
const uniqueArray = <T>(array: T[]): T[] => {
	return array.filter((item: T, pos: number) => {
		return array.indexOf(item) === pos;
	});
};
export default uniqueArray;
