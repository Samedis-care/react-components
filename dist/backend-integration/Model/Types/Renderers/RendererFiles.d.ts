import React from "react";
import ModelRenderParams from "../../RenderParams";
import TypeFiles from "../TypeFiles";
import { FileData } from "../../../../standalone/FileUpload/Generic";
/**
 * Renders a file selector
 * @remarks In a grid cell (overview visibility with `grid`) the files take one
 *          line (FilesGrid): "No files present", the only file's name as a link
 *          to it, or for more files their count ("2 files") as a button that
 *          opens a menu of the files.
 */
declare class RendererFiles extends TypeFiles {
    render(params: ModelRenderParams<FileData[]>): React.ReactElement;
}
export default RendererFiles;
