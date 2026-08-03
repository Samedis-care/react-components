export type FileSelectorError =
	| "files.selector.too-many" // too many files have been selected
	| "files.selector.limit-reached" // file limit has been reached
	| "files.type.invalid" // file type invalid
	| "files.image.load-failed" // the browser couldn't decode a selected image
	| "files.image.process-failed"; // a selected image couldn't be processed
