/**
 * Returns the last element of an array
 * @param arr The array
 */
const last = <T>(arr: T[]): T => {
	return arr[arr.length - 1];
};

export default last;
