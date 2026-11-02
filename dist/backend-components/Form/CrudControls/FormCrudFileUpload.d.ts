import React from "react";
import { CrudFileUploadProps } from "../../FileUpload/CrudFileUpload";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
import { FileUploadDispatch } from "../../../standalone/FileUpload/Generic";
export interface FormCrudFileUploadProps extends Omit<CrudFileUploadProps, "connector" | "errorComponent">, UseLazyCrudConnectorParams<Record<string, unknown>> {
    /**
     * Is the control read-only?
     * @remarks It is read-only while the Form is, whatever this says.
     */
    readOnly?: boolean;
    /**
     * Mark the control as modified while file changes are queued
     * @remarks Follows the Form's `showDirtyState` unless set.
     * @see CrudFileUploadProps.showDirtyState
     */
    showDirtyState?: boolean;
}
declare const _default: React.NamedExoticComponent<Omit<FormCrudFileUploadProps & React.RefAttributes<FileUploadDispatch>, "ref"> & React.RefAttributes<FileUploadDispatch>>;
export default _default;
