import React, { Dispatch, SetStateAction } from "react";
import { ModelFieldDefinitionUnknown, ModelFieldNames, ModelUnknown } from "../../../backend-integration";
import { FileData } from "../../../standalone/FileUpload/Generic";
import { ValidationResult } from "../../Form";
export type ConversionScriptFn = (record: Record<string, unknown>) => unknown;
export interface CrudImportProps<M extends ModelUnknown> {
    /**
     * The model to import for
     */
    model: M;
    /**
     * The importer config
     * Record<Field, JavaScript>
     * @remarks Disables step 2
     */
    importConfig?: Partial<Record<ModelFieldNames<M>, ConversionScriptFn>>;
    /**
     * The field used to determine an ID of an existing record for purpose of updating that existing record
     * instead of creating a new record.
     */
    updateKey?: ModelFieldNames<M>;
    /**
     * Additional filter parameter for backend index calls
     */
    updateKeyAdditionalFilters?: Record<string, unknown>;
    /**
     * How-to information
     */
    howTo?: (string | React.ReactNode)[];
    /**
     * Additional validation callback for imported records
     * @param record The record to validate
     * @returns Validation errors
     */
    validate?: (record: Record<string, unknown>) => Promise<ValidationResult> | ValidationResult;
    /**
     * Guided version
     */
    guided: boolean;
}
export declare const IMPORT_STEPS: string[];
interface ConversionScript {
    script?: string;
    scriptFn: ConversionScriptFn;
    status: "pending" | "okay" | "error";
    error: Error | null;
}
export interface CrudImporterState {
    files: FileData[];
    data: Record<string, unknown>[];
    conversionScripts: Record<string, ConversionScript>;
    validationPassed: boolean;
    importDone: boolean;
}
export interface CrudImporterStepProps {
    model: ModelUnknown;
    updateKey: string | undefined;
    additionalUpdateKeyFilters: Record<string, unknown> | undefined;
    hasImportConfig: boolean;
    validate: undefined | ((record: Record<string, unknown>) => Promise<ValidationResult> | ValidationResult);
    state: CrudImporterState;
    setState: Dispatch<SetStateAction<CrudImporterState>>;
}
export declare const isFieldImportable: (name: string, field: ModelFieldDefinitionUnknown) => boolean;
export declare const useCrudImportLogic: <M extends ModelUnknown>(props: CrudImportProps<M>) => {
    guided: false | Partial<Record<ModelFieldNames<M>, ConversionScriptFn>> | undefined;
    activeStep: number;
    state: CrudImporterState;
    setState: React.Dispatch<React.SetStateAction<CrudImporterState>>;
    hasImportConfig: boolean;
    next: () => void;
    prev: () => void;
    finish: () => void;
};
declare const CrudImport: <M extends ModelUnknown>(props: CrudImportProps<M>) => React.JSX.Element;
declare const _default: typeof CrudImport;
export default _default;
export type CrudImportType = typeof CrudImport;
