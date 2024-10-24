import { normalizeDate } from "./Utils/DateUtils";
import ccI18n from "../../../i18n";
import moment from "moment";
/**
 * Type for non-nullable dates
 */
class TypeDate {
    error = "";
    validate() {
        return this.error || null;
    }
    getFilterType() {
        return "date";
    }
    getDefaultValue() {
        return normalizeDate(new Date());
    }
    stringify(value) {
        return value.toLocaleDateString(ccI18n.language);
    }
    serialize = (value) => {
        return value.toISOString();
    };
    deserialize = (value) => {
        return new Date(value);
    };
    /**
     * Formatting helper used in date renderers
     * @param value The user input
     * @returns The formatted value
     */
    static format = (value) => {
        // convert format to __/__/____
        let format = moment()
            .locale(ccI18n.language)
            .localeData()
            .longDateFormat("L")
            .replace(/[DMY]/gm, "_");
        // get numeric values from user input
        const values = value.replace(/([^0-9])/gm, "");
        if (values.length === 0)
            return "";
        // replace _ in format with user input values
        let vI = 0;
        for (let i = 0; i < format.length && vI < values.length; ++i) {
            if (format[i] === "_") {
                format = format.replace("_", values[vI++]);
            }
        }
        return format;
    };
}
export default TypeDate;
