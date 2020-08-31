export default async (file: File): Promise<string> => {
	// file -> data url
	const reader = new FileReader();
	return new Promise((resolve, reject) => {
		reader.addEventListener("loadend", () => {
			resolve(reader.result as string);
		});
		reader.addEventListener("error", () => {
			reject(reader.error);
		});
		reader.readAsDataURL(file);
	});
};
