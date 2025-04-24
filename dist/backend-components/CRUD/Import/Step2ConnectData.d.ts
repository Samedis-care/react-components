import React from "react";
import { CrudImporterStepProps } from "./index";
import { ModelFieldDefinition, PageVisibility } from "../../../backend-integration";
type ConversionScriptRunnerFunc = (data: Record<string, unknown>[], field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>, script: string) => Promise<void>;
export declare const useImportStep2Logic: (props: CrudImporterStepProps) => {
    columns: string[];
    conversionScriptUpdates: React.RefObject<Record<string, ConversionScriptRunnerFunc>>;
    handleConversionScriptChange: (evt: React.ChangeEvent<HTMLTextAreaElement>) => Promise<void>;
};
declare const _default: React.MemoExoticComponent<(props: CrudImporterStepProps) => React.JSX.Element>;
export default _default;
