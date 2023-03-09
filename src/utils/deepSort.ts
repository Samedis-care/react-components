import isPlainObject from "./isPlainObject";

const deepSort = <T>(data: T): T => {
	if (!isPlainObject(data)) return data;
	const newData: Record<string, unknown> = {};
	Object.entries(data)
		.sort((a, b) => a[0].localeCompare(b[0]))
		.forEach(([k, v]) => {
			newData[k] = deepSort(v);
		});
	return newData as T;
};

export default deepSort;
