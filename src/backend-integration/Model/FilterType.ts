/**
 * A filter type which is used as indicator for sorting and filtering
 */
type FilterType =
	| "string"
	| "number"
	| "currency"
	| "date"
	| "boolean"
	| "enum"
	| null;

export default FilterType;
