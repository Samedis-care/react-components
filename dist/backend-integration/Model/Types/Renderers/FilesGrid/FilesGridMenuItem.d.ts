import React from "react";
import type { FileData } from "../../../../../standalone/FileUpload/Generic";
export interface FilesGridMenuItemProps {
    /**
     * The file to show
     */
    file: FileData;
    /**
     * Closes the menu, called when the file is opened
     */
    onClose: () => void;
}
declare const _default: React.NamedExoticComponent<FilesGridMenuItemProps & React.RefAttributes<HTMLLIElement>>;
export default _default;
