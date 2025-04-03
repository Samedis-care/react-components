export const isValidationError = (e) => {
    return e.name === "CcValidationError";
};
export default class ValidationError extends Error {
    result;
    mode;
    constructor(mode, result) {
        super(`ValidationError of type ${mode} for keys ${Object.keys(result).join(",")}`);
        this.name = "CcValidationError";
        this.mode = mode;
        this.result = result;
    }
}
