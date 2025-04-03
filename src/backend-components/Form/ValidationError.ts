import { ValidationResult } from "./Form";

export const isValidationError = (e: Error): e is ValidationError => {
	return e.name === "CcValidationError";
};

export default class ValidationError extends Error {
	result: ValidationResult;
	mode: "warn" | "error";
	constructor(mode: "warn" | "error", result: ValidationResult) {
		super(
			`ValidationError of type ${mode} for keys ${Object.keys(result).join(",")}`,
		);
		this.name = "CcValidationError";
		this.mode = mode;
		this.result = result;
	}
}
