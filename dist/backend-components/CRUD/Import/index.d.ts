import React, { Dispatch, SetStateAction } from "react";
import { Model, ModelFieldDefinition, ModelFieldName, PageVisibility } from "../../../backend-integration";
import { FileData } from "../../../standalone/FileUpload/Generic";
import { ValidationError } from "../../Form";
export interface CrudImportProps<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT> {
    /**
     * The model to import for
     */
    model: Model<KeyT, VisibilityT, CustomT>;
    /**
     * The importer config
     * Record<Field, JavaScript>
     * @remarks Disables step 2
     */
    importConfig?: Partial<Record<KeyT, string>>;
    /**
     * The field used to determine an ID of an existing record for purpose of updating that existing record
     * instead of creating a new record.
     */
    updateKey?: KeyT;
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
    validate?: (record: Record<string, unknown>) => Promise<ValidationError> | ValidationError;
    /**
     * Guided version
     */
    guided: boolean;
}
export declare const IMPORT_STEPS: string[];
interface ConversionScript {
    script: string;
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
    model: Model<ModelFieldName, PageVisibility, unknown>;
    updateKey: string | undefined;
    additionalUpdateKeyFilters: Record<string, unknown> | undefined;
    hasImportConfig: boolean;
    validate: undefined | ((record: Record<string, unknown>) => Promise<ValidationError> | ValidationError);
    state: CrudImporterState;
    setState: Dispatch<SetStateAction<CrudImporterState>>;
}
export declare const isFieldImportable: (name: string, field: ModelFieldDefinition<unknown, string, PageVisibility, unknown>) => boolean;
export declare const useCrudImportLogic: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(props: CrudImportProps<KeyT, VisibilityT, CustomT>) => {
    guided: false | Partial<Record<KeyT, string>> | undefined;
    activeStep: number;
    state: CrudImporterState;
    setState: React.Dispatch<React.SetStateAction<CrudImporterState>>;
    hasImportConfig: boolean;
    next: () => void;
    prev: () => void;
    finish: () => void;
};
declare const CrudImport: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(props: CrudImportProps<KeyT, VisibilityT, CustomT>) => JSX.Element;
declare const _default: <KeyT extends string, VisibilityT extends PageVisibility, CustomT>(props: CrudImportProps<KeyT, VisibilityT, CustomT>) => JSX.Element;
export default _default;
export declare type CrudImportType = typeof CrudImport;
