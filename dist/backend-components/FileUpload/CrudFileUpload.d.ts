import React from "react";
import { FileData, FileMeta, FileUploadDispatch, FileUploadProps } from "../../standalone/FileUpload/Generic";
import { Connector } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
export interface CrudFileUploadProps extends Omit<FileUploadProps, "files" | "handleError"> {
    /**
     * The backend connector used as CRUD interface
     * @remarks Null renders a read-only control that lists `additionalFiles`. A connector
     *          passed later is loaded.
     */
    connector: Connector | null;
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Callback for serializing a picked file before passing it to the backend connector
     * @param data The file data to serialize
     * @returns Data to be passed to the backend connector's create
     */
    serialize: (data: FileData<File>) => Promise<Record<string, unknown>> | Record<string, unknown>;
    /**
     * Callback for deserializing data after getting it from the backend connector
     * @param data The data from the backend connector (index function)
     * @returns The file data which can be used by the control
     * @remarks With `maxTotalFileSize`, set `file.size`: every file the control lists
     *          comes from here, a picked one too once its upload is created, and one
     *          without a size counts as 0 bytes.
     */
    deserialize: (data: Record<string, unknown>) => Promise<FileData<BackendFileMeta>> | FileData<BackendFileMeta>;
    /**
     * Files of someone else, listed after this control's own files, read-only
     * @remarks Never written through `connector`, whatever flags they carry: a `delete` or
     *          `canBeUploaded` only changes how they are shown.
     */
    additionalFiles?: FileData<FileMeta>[];
    /**
     * Mark the control as modified while file changes are queued
     * @remarks Off by default, like `FormProps.showDirtyState`. An explicit `dirty` prop
     *          wins over it, and it shows nothing without a LazyConnector, where a change
     *          is written before this control hears about it.
     */
    showDirtyState?: boolean;
    /**
     * Called with the current state on mount, and whenever queued file changes appear or
     * are written
     * @param dirty Are file changes waiting to be written?
     * @remarks Independent of showDirtyState — pending changes are state, not display —
     *          and always false without a LazyConnector. Memoize the handler.
     */
    onDirtyChange?: (dirty: boolean) => void;
}
export interface BackendFileMeta extends FileMeta {
    /**
     * The ID of the file in backend
     */
    id: string;
}
declare const _default: React.NamedExoticComponent<Omit<CrudFileUploadProps & React.RefAttributes<FileUploadDispatch>, "ref"> & React.RefAttributes<FileUploadDispatch>>;
export default _default;
