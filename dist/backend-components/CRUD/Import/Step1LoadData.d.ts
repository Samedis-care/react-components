import React from "react";
import { CrudImporterStepProps } from "./index";
import { FileUploadProps } from "../../../standalone/FileUpload/Generic";
export type ImportStep1Props = CrudImporterStepProps & {
    howTo?: (string | React.ReactNode)[];
};
/**
 * The upload of step 1 (Upload data): the props for a FileUploadGeneric that reads one .xlsx
 * file into `state.files` and `state.data`
 * @param props The step's props: the wizard's state and its setter
 * @returns The upload's `handleError`, `files`, `accept`, `maxFiles` and `onChange`
 * @remarks One file: a new pick or drop replaces the listed file (the listed file is
 *          passed with `excludeFromLimits`, so `maxFiles` 1 refuses only a selection of
 *          several files). The replaced file and its rows leave `state` at once, so Next
 *          waits for the new file's rows; the new file is listed meanwhile.
 */
export declare const useImportStep1FileUploadProps: (props: ImportStep1Props) => Pick<FileUploadProps, "handleError" | "files" | "accept" | "maxFiles" | "onChange">;
declare const _default: React.MemoExoticComponent<(props: ImportStep1Props) => React.JSX.Element>;
export default _default;
