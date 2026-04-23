import React from "react";
import { CrudImporterStepProps } from "./index";
import { FileUploadProps } from "../../../standalone/FileUpload/Generic";
export type ImportStep1Props = CrudImporterStepProps & {
    howTo?: (string | React.ReactNode)[];
};
export declare const useImportStep1FileUploadProps: (props: ImportStep1Props) => Pick<FileUploadProps, "handleError" | "files" | "accept" | "maxFiles" | "onChange">;
declare const _default: React.MemoExoticComponent<(props: ImportStep1Props) => import("react/jsx-runtime").JSX.Element>;
export default _default;
