import React from "react";
import { CrudImporterStepProps } from "./index";
type RecordT = [Record<string, unknown>, Record<string, string>, Error | null];
export declare const useImportStep3Logic: (props: CrudImporterStepProps) => {
    records: RecordT[] | null;
    recordsNormalized: {
        validation_errors: string;
        conversion_errors: string;
    }[];
    everythingOkay: boolean;
};
declare const _default: React.MemoExoticComponent<(props: CrudImporterStepProps) => React.JSX.Element>;
export default _default;