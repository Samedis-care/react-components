/**
 * A filter type which is used as indicator for sorting and filtering
 */
export type FilterType =
	| "id"
	| "string"
	| "localized-string"
	| "combined-string"
	| "number"
	| "currency"
	| "date"
	| "datetime"
	| "boolean"
	| "enum"
	| "custom"
	| null;

export default FilterType;
