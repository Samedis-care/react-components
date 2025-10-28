import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import {
	FileData,
	FileMeta,
	FileUploadProps,
} from "../../../standalone/FileUpload/Generic";
import fileToData from "../../../utils/fileToData";

export interface TypeFilesParams
	extends Partial<
		Pick<
			FileUploadProps,
			| "maxFiles"
			| "accept"
			| "acceptLabel"
			| "imageDownscaleOptions"
			| "convertImagesTo"
			| "previewSize"
			| "previewImages"
			| "allowDuplicates"
			| "smallLabel"
			| "variant"
		>
	> {
	/**
	 * Should we always send the raw file even if there is a preview? Defaults to false
	 */
	alwaysSendRawData?: boolean;
}

interface FileWithData extends FileData<FileMeta> {
	/**
	 * The raw file data
	 */
	data?: string;
}

/**
 * A type to handle files
 */
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

	serialize = async (files: FileData[]): Promise<FileWithData[]> => {
		return await Promise.all(
			files.map(async (file) => ({
				...file,
				file: {
					name: file.file.name,
					type: file.file.type,
				},
				preview: file.preview,
				data:
					file.canBeUploaded &&
					(this.params?.alwaysSendRawData || !file.preview)
						? await fileToData(file.file as File)
						: undefined,
			})),
		);
	};

	stringify(values: FileData[]): string {
		return values.map((value) => value.file.name).join(", ");
	}
}

export default TypeFiles;
