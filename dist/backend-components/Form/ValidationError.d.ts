import { ValidationResult } from "./Form";
export declare const isValidationError: (e: Error) => e is ValidationError;
export default class ValidationError extends Error {
    result: ValidationResult;
    mode: "warn" | "error";
    constructor(mode: "warn" | "error", result: ValidationResult);
}
