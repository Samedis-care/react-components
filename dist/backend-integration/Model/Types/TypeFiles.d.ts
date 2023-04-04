import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { FileData, FileMeta, FileUploadProps } from "../../../standalone/FileUpload/Generic";
export interface TypeFilesParams extends Partial<Pick<FileUploadProps, "maxFiles" | "accept" | "acceptLabel" | "imageDownscaleOptions" | "convertImagesTo" | "previewSize" | "previewImages" | "allowDuplicates" | "smallLabel" | "variant">> {
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
declare abstract class TypeFiles implements Type<FileData[]> {
    protected params?: TypeFilesParams;
    constructor(params?: TypeFilesParams);
    abstract render(params: ModelRenderParams<FileData[]>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): FileData[];
    serialize: (files: FileData[]) => Promise<FileWithData[]>;
    stringify(values: FileData[]): string;
}
export default TypeFiles;
