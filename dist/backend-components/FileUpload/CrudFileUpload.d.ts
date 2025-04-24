import React from "react";
import { FileData, FileMeta, FileUploadDispatch, FileUploadProps } from "../../standalone/FileUpload/Generic";
import { Connector, PageVisibility } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
export interface CrudFileUploadProps extends Omit<FileUploadProps, "files" | "handleError"> {
    /**
     * The backend connector used as CRUD interface
     * @remarks Passing null will render an readOnly control
     */
    connector: Connector<string, PageVisibility, unknown> | null;
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Callback for serializing data before passing it to the backend connector
     * @param data The file data to serialize
     * @param id The file id or null if upload new
     * @returns Data to be passed to the backend connector
     */
    serialize: (data: FileData<File>, id: string | null) => Promise<Record<string, unknown>> | Record<string, unknown>;
    /**
     * Callback for deserializing data after getting it from the backend connector
     * @param data The data from the backend connector (index function)
     * @returns The file data which can be used by the control
     */
    deserialize: (data: Record<string, unknown>) => Promise<FileData<BackendFileMeta>> | FileData<BackendFileMeta>;
}
export interface BackendFileMeta extends FileMeta {
    /**
     * The ID of the file in backend
     */
    id: string;
}
declare const _default: React.NamedExoticComponent<Omit<CrudFileUploadProps & React.RefAttributes<FileUploadDispatch>, "ref"> & React.RefAttributes<FileUploadDispatch>>;
export default _default;
