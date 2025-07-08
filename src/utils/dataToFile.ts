import getDataUriMime from "./getDataUriMime";

/**
 * Converts data URI to a blob
 * @param data The data URI
 * @return The blob
 */
const dataToFile = (data: string): Blob => {
	// handle empty data uri
	if (data === "data:") return new Blob([new Uint8Array(0)]);

	const arr = data.split(",");
	if (arr.length < 2) throw new Error("Invalid data uri: " + data.slice(0, 64));
	const mime = getDataUriMime(data);
	if (!mime)
		throw new Error("mimeMatch invalid for data uri: " + data.slice(0, 64));
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
};

export default dataToFile;
