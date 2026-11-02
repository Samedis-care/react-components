import React from "react";
import { FileData, FileMeta, FileUploadDispatch, FileUploadProps } from "../../standalone/FileUpload/Generic";
import { Connector } from "../../backend-integration";
import { ErrorComponentProps } from "../Form";
export interface CrudFileUploadProps extends Omit<FileUploadProps, "files" | "defaultFiles" | "handleError" | "busy" | "onRestoreFile"> {
    /**
     * The backend connector used as CRUD interface
     * @remarks A LazyConnector queues every write until its queue is written, which a Form
     *          does after saving. Any other connector is written at once. The control tells
     *          the two apart with `instanceof LazyConnector`, so a connector that wraps a
     *          LazyConnector counts as written at once.
     *
     *          Null renders a read-only control that lists `additionalFiles`. Read once:
     *          the first connector passed (after null, if any) is listed and written for
     *          as long as the control is mounted, and a later one is ignored. To show
     *          another collection, remount the control, e.g. with a `key` per record.
     */
    connector: Connector | null;
    /**
     * The error component that is used to display errors
     */
    errorComponent: React.ComponentType<ErrorComponentProps>;
    /**
     * Callback for delete confirmation, asked before a file is removed with its remove button
     * @remarks Without a LazyConnector the removal deletes the file on the server at once,
     *          with no undo. With one it is only queued, and can be restored until the
     *          queue is written.
     * @see FileUploadProps.onDelete
     */
    onDelete?: FileUploadProps["onDelete"];
    /**
     * Callback for serializing a picked file before passing it to the backend connector
     * @param data The file data to serialize
     * @returns Data to be passed to the backend connector's create
     */
    serialize: (data: FileData<File>) => Promise<Record<string, unknown>> | Record<string, unknown>;
    /**
     * Callback for deserializing data after getting it from the backend connector
     * @param data A record from the connector: a row of `index` or what `create` returned.
     *             From a LazyConnector, a queued upload is what `serialize` returned, with
     *             a client-side `id` (`fake-id-N`), so it holds the picked file where the
     *             backend would send a URL. It is listed that way by `index` too, until the
     *             queue is written.
     * @returns The file data which can be used by the control
     * @remarks With `maxTotalFileSize`, set `file.size`: every file the control lists
     *          comes from here, a picked one too once its upload is created, and one
     *          without a size counts as 0 bytes.
     */
    deserialize: (data: Record<string, unknown>) => Promise<FileData<BackendFileMeta>> | FileData<BackendFileMeta>;
    /**
     * Files of someone else, listed after this control's own files, read-only
     * @remarks Never written through `connector`, whatever flags they carry: a `delete` or
     *          `canBeUploaded` only changes how they are shown. They do not count toward
     *          `maxFiles` and `maxTotalFileSize`.
     */
    additionalFiles?: FileData<FileMeta>[];
    /**
     * Called with this control's own files whenever they change: once they are loaded, and
     * after each change was written or queued
     * @param files Neither `additionalFiles` nor a picked file that is still being
     *              uploaded. A queued removal is listed with `delete` set. With a
     *              LazyConnector, a file uploaded through it keeps its client-side id,
     *              also after the queue was written: `LazyConnector.mapId` gives the
     *              server's.
     * @remarks Not called before the files are loaded, after a failed load, or for a new
     *          handler alone.
     */
    onChange?: FileUploadProps["onChange"];
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
