import React from "react";
import { CrudMultiImageProps } from "../../FileUpload/CrudMultiImage";
import { UseLazyCrudConnectorParams } from "../useLazyCrudConnector";
export interface FormCrudMultiImageProps extends Omit<CrudMultiImageProps, "connector" | "errorComponent">, UseLazyCrudConnectorParams<Record<string, unknown>> {
    /**
     * Is the control read-only?
     * @remarks It is read-only while the Form is, whatever this says.
     */
    readOnly?: boolean;
}
declare const _default: React.MemoExoticComponent<(props: FormCrudMultiImageProps) => React.JSX.Element>;
export default _default;
