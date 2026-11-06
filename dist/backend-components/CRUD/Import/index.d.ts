import React, { Dispatch, SetStateAction } from "react";
import { ModelFieldDefinitionUnknown, ModelFieldNames, ModelUnknown } from "../../../backend-integration";
import { FileData } from "../../../standalone/FileUpload/Generic";
import { ValidationResult } from "../../Form";
/**
 * Converts one row of the uploaded worksheet into the value of one model field: an entry
 * of CrudImportProps.importConfig, or the script typed in step 2 of the unguided importer.
 *
 * For a date-only field (ModelDataTypeDate, ModelDataTypeDateNullable) return a Date: the
 * importer validates and writes the calendar day it names, at 12:00 UTC as the date
 * pickers do. A Date at exactly 00:00 or 12:00 UTC names its UTC date
 * (`new Date("2024-03-31")`, `toDateOnly(…)`), any other its local date
 * (`new Date(record.Born)` of a date cell, which arrives as local time without an offset,
 * `"2024-03-31T00:00:00"`). In UTC+12 local midnight is 12:00 UTC, so there use
 * `new Date(record.Born.slice(0, 10))`, which names the cell's day in every timezone.
 */
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
