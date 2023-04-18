import React from "react";
import { CrudImporterStepProps } from "./index";
interface ImportCounters {
    todo: number;
    success: number;
    failed: number;
}
export declare const useImportStep4Logic: (props: CrudImporterStepProps) => {
    counters: ImportCounters;
    lastError: string;
};
declare const _default: React.MemoExoticComponent<(props: CrudImporterStepProps) => JSX.Element>;
export default _default;
