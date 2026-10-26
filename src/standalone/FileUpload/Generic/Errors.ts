export type FileSelectorError =
	| "files.selector.too-many" // too many files have been selected
	| "files.selector.limit-reached" // file limit has been reached
	| "files.selector.too-large" // the files would be larger than maxTotalFileSize together
	| "files.size.too-small" // a selected file is smaller than minFileSize
	| "files.size.too-large" // a selected file is larger than maxFileSize
	| "files.type.invalid" // file type invalid
	| "files.image.load-failed" // the browser couldn't decode a selected image
	| "files.image.process-failed"; // a selected image couldn't be processed
