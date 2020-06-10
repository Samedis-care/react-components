import React from "react";
import "../../../i18n";
import FileUpload from "../../../standalone/FileUpload/Generic";

export default {
	title: "Standalone/FileUpload",
	component: FileUpload,
};

export const FileUploadStory = () => {
	return <FileUpload maxFiles={3} previewSize={128} />;
};

FileUploadStory.story = {
	name: "FileUpload",
};
