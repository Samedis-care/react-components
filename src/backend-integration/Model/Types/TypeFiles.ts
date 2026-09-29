import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import {
	FileData,
	FileMeta,
	FileUploadProps,
} from "../../../standalone/FileUpload/Generic";

export interface TypeFilesParams extends Partial<
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
	 * The raw file
	 */
	data?: File;
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

	/**
	 * @remarks The files stay Blobs, the API client decides how to send them. An array of
	 *          objects cannot be sent as Rails multipart, so RailsApiClient sends this as
	 *          JSON with the files as data URIs.
	 */
	serialize = (files: FileData[]): FileWithData[] =>
		files.map((file) => ({
			...file,
			file: {
				name: file.file.name,
				type: file.file.type,
			},
			preview: file.preview,
			data:
				file.canBeUploaded && (this.params?.alwaysSendRawData || !file.preview)
					? (file.file as File)
					: undefined,
		}));

	stringify(values: FileData[]): string {
		return values.map((value) => value.file.name).join(", ");
	}
}

export default TypeFiles;
