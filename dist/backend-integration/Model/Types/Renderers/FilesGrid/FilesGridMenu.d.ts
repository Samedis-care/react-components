import React from "react";
import type { FileData } from "../../../../../standalone/FileUpload/Generic";
export interface FilesGridMenuProps {
    /**
     * The files to list, two or more
     */
    files: FileData[];
}
declare const _default: React.MemoExoticComponent<(props: FilesGridMenuProps) => React.JSX.Element>;
export default _default;
