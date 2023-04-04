import { normalizeDate } from "./Utils/DateUtils";
import ccI18n from "../../../i18n";
import moment from "moment";
import i18n from "../../../i18n";
/**
 * Type for non-nullable dates
 */
var TypeDate = /** @class */ (function () {
    function TypeDate() {
        this.error = "";
        this.serialize = function (value) {
            return value.toISOString();
        };
        this.deserialize = function (value) {
            return new Date(value);
        };
    }
    TypeDate.prototype.validate = function () {
        return this.error || null;
    };
    TypeDate.prototype.getFilterType = function () {
        return "date";
    };
    TypeDate.prototype.getDefaultValue = function () {
        return normalizeDate(new Date());
    };
    TypeDate.prototype.stringify = function (value) {
        return value.toLocaleDateString(i18n.language);
    };
    /**
     * Formatting helper used in date renderers
     * @param value The user input
     * @returns The formatted value
     */
    TypeDate.format = function (value) {
        // convert format to __/__/____
        var format = moment()
            .locale(ccI18n.language)
            .localeData()
            .longDateFormat("L")
            .replace(/[DMY]/gm, "_");
        // get numeric values from user input
        var values = value.replace(/([^0-9])/gm, "");
        if (values.length === 0)
            return "";
        // replace _ in format with user input values
        var vI = 0;
        for (var i = 0; i < format.length && vI < values.length; ++i) {
            if (format[i] === "_") {
                format = format.replace("_", values[vI++]);
            }
        }
        return format;
    };
    return TypeDate;
}());
export default TypeDate;
