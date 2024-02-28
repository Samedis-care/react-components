import React from "react";
import { CrudImporterStepProps } from "./index";
import { FileUploadProps } from "../../../standalone/FileUpload/Generic";
export type ImportStep1Props = CrudImporterStepProps & {
    howTo?: (string | React.ReactNode)[];
};
export declare const useImportStep1FileUploadProps: (props: ImportStep1Props) => Pick<FileUploadProps, "onChange" | "accept" | "maxFiles" | "handleError" | "files">;
declare const _default: React.MemoExoticComponent<(props: ImportStep1Props) => JSX.Element>;
export default _default;
