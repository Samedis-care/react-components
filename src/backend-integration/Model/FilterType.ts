/**
 * A filter type which is used as indicator for sorting and filtering
 */
export type FilterType =
	| "string"
	| "localized-string"
	| "combined-string"
	| "number"
	| "currency"
	| "date"
	| "datetime"
	| "boolean"
	| "enum"
	| null;

export default FilterType;
