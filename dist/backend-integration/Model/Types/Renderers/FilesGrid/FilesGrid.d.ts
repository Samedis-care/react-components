import React from "react";
import type { FileData } from "../../../../../standalone/FileUpload/Generic";
export type FilesGridClassKey = "root" | "menuButton";
export interface FilesGridProps {
    /**
     * The files to show
     */
    files: FileData[];
}
declare const _default: React.MemoExoticComponent<(props: FilesGridProps) => React.JSX.Element>;
export default _default;
