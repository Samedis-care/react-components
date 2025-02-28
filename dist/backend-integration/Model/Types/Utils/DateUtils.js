/**
 * Sets the date to noon UTC
 * @param date A date
 * @returns A date "without time"
 */
export const normalizeDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    // Create a new Date at 12:00 in UTC based on the local date parts.
    return new Date(Date.UTC(year, month, day, 12, 0, 0));
};
