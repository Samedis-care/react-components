import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import {
	FileData,
	FileUploadProps,
} from "../../../standalone/FileUpload/Generic";

export type TypeFilesParams = Pick<
	FileUploadProps,
	| "maxFiles"
	| "accept"
	| "acceptLabel"
	| "imageDownscaleOptions"
	| "convertImagesTo"
	| "previewSize"
	| "previewImages"
	| "allowDuplicates"
>;

abstract class TypeFiles implements Type<FileData[]> {
	protected params?: TypeFilesParams;

	constructor(params?: TypeFilesParams) {
		this.params = params;
	}

	abstract render(params: ModelRenderParams<FileData[]>): React.ReactElement;

	validate(): string | null {
		return null;
	}

	getFilterType(): FilterType {
		return null;
	}

	getDefaultValue(): FileData[] {
		return [];
	}
}

export default TypeFiles;
