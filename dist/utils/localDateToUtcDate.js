/**
 * Rebuilds a date from its local parts, interpreted as UTC
 * @param date A date
 * @returns The date with its local parts moved to UTC
 * @deprecated For date-only values use `normalizeDate` instead — this anchors at
 * UTC midnight, which reads back as the previous day in every timezone behind
 * UTC. See src/utils/dateOnlyUtils.ts for the date-only value contract.
 */
const localDateToUtcDate = (date) => {
    const year = date.getFullYear();
    const utc = new Date(Date.UTC(year, date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
    // Date.UTC maps the years 0–99 to 1900+year, see dateOnlyUtils
    if (year >= 0 && year <= 99)
        utc.setUTCFullYear(year);
    return utc;
};
export default localDateToUtcDate;
