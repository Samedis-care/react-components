import { ModelFieldDefinitionUnknown } from "../../../backend-integration";
/**
 * Turns a conversion's result into the value the import validates and writes for the
 * field.
 *
 * A valid Date for a date-only field (a ModelDataTypeDate or ModelDataTypeDateNullable)
 * becomes the date-only value (12:00 UTC) of the calendar day it names:
 * - a Date at exactly 00:00 or 12:00 UTC by its UTC date. A date without a time
 *   (`new Date("2024-03-31")`), `Date.UTC(…)` and `toDateOnly(…)` give such a Date.
 * - any other Date by its local date. `new Date(record.Born)` of a date cell gives such a
 *   Date, as step 1 hands date cells over in local time without an offset
 *   (`"2024-03-31T00:00:00"`).
 *
 * In UTC+12 local midnight is 12:00 UTC, so there `new Date(record.Born)` names the day
 * before; `new Date(record.Born.slice(0, 10))` names the cell's day in every timezone.
 * Every other result, an invalid Date included, is returned as it is.
 * @param field The field the result is for
 * @param value The conversion's result
 * @returns The value for the record
 */
declare const normalizeImportValue: (field: ModelFieldDefinitionUnknown, value: unknown) => unknown;
export default normalizeImportValue;
