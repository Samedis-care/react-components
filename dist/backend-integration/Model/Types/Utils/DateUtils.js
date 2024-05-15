/**
 * Sets the date to noon UTC
 * @param date A date
 * @returns A date "without time"
 */
export const normalizeDate = (date) => {
    const newDate = new Date(date);
    newDate.setUTCHours(12, 0, 0, 0); // set to noon, so when we read this from any timezone, including american timezones the date is correct
    return newDate;
};
