/**
 * Converts data URI to a blob
 * @param data The data URI
 * @return The blob
 */
const dataToFile = (data: string): Blob => {
	const arr = data.split(",");
	if (arr.length < 2) throw new Error("Invalid data uri: " + data.slice(0, 64));
	const mimeMatch = arr[0].match(/:(.*?);/);
	if (!mimeMatch || mimeMatch.length < 2) throw new Error("mimeMatch invalid");
	const mime = mimeMatch[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new Blob([u8arr], { type: mime });
};

export default dataToFile;
