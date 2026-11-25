import { ValidationResult } from "./Form";
/**
 * Whether `e` is a ValidationError, also one from another copy of the library (checks the
 * name, `CcValidationError`, not the class)
 * @param e The error to check
 * @returns true for a ValidationError
 */
export declare const isValidationError: (e: Error) => e is ValidationError;
/**
 * The error that carries the messages of a failed validation. The Form throws it from submit
 * when validation fails (`"error"`) or when the user declines to save with warnings
 * (`"warn"`), and it is the only value showErrorDialog lists under "Error on validation".
 * To throw or show the ValidationResult a validate function returned, wrap it:
 * @example
 * const result = await validateForm();
 * if (!isObjectEmpty(result)) throw new ValidationError("error", result);
 */
export default class ValidationError extends Error {
    /** The messages by field name */
    result: ValidationResult;
    /** `"error"` for failed validations, `"warn"` for warnings the user declined */
    mode: "warn" | "error";
    /**
     * @param mode `"error"` for failed validations, `"warn"` for declined warnings
     * @param result The messages by field name
     */
    constructor(mode: "warn" | "error", result: ValidationResult);
}
