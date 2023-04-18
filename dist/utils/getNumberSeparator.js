import ccI18n from "../i18n";
/**
 * Gets the group separator from number by language
 * @param separatorType The separator type
 */
var getNumberSeparator = function (separatorType) {
    var format = Intl.NumberFormat(ccI18n.language)
        .formatToParts(1000.11)
        .find(function (part) { return part.type === separatorType; });
    return format === undefined ? "," : format.value;
};
export default getNumberSeparator;
