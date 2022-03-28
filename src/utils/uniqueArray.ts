/**
 * Gets the uniq elements from given array
 * @param array The array object
 */
const uniqueArray = <T>(array: T[]): T[] => {
	return array.filter((item: T, pos: number) => {
		return array.indexOf(item) === pos;
	});
};

export const isUniqueArray = <T>(array: T[]): boolean => {
	return (
		array.find((item: T, pos: number) => {
			return array.indexOf(item) !== pos;
		}) == null
	);
};

export default uniqueArray;
