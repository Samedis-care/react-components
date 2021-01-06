/**
 * Gets the uniq elements from giver array
 * @param array The array object
 */
export const uniqueArray = <T>(array: T[]): T[] => {
	return array.filter((item: T, pos: number) => {
		return array.indexOf(item) === pos;
	});
};
