export type FileSelectorError =
	| "files.selector.too-many" // too many files have been selected
	| "files.selector.limit-reached"; // file limit has been reached
