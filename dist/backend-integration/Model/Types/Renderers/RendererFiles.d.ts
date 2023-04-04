import React from "react";
import { ModelRenderParams } from "../../index";
import TypeFiles from "../TypeFiles";
import { FileData } from "../../../../standalone/FileUpload/Generic";
/**
 * Renders a file selector
 */
declare class RendererFiles extends TypeFiles {
    render(params: ModelRenderParams<FileData[]>): React.ReactElement;
}
export default RendererFiles;
