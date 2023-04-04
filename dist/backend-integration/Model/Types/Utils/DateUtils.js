/**
 * Sets the date to midnight UTC
 * @param date A date
 * @returns A date "without time"
 */
export var normalizeDate = function (date) {
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000);
};
