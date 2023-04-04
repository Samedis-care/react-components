/**
 * A filter type which is used as indicator for sorting and filtering
 */
declare type FilterType = "string" | "localized-string" | "combined-string" | "number" | "currency" | "date" | "datetime" | "boolean" | "enum" | null;
export default FilterType;
