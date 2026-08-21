import moment from "moment";
/**
 * Builds the columns of a day-per-column matrix.
 * @param params The range, and how to mark the days in it
 * @returns One column per day, keyed by ISO date, labeled with the day number
 * and the localized short weekday
 * @remarks The weekday names come from Intl, not from moment, so a consumer
 * does not have to bundle moment's locale files to get localized headers.
 */
const buildDateColumns = (params) => {
    const { from, to, locale, accent, mutedWeekdays = [0, 6], maxColumns = 400, } = params;
    // Normalized rather than compared as given: a caller that hands over a
    // timestamp ("2026-03-07T00:00:00Z") would otherwise match no column at
    // all, and silently mark nothing.
    const today = params.today === undefined
        ? moment().format("YYYY-MM-DD")
        : params.today === null
            ? null
            : moment(params.today).format("YYYY-MM-DD");
    const accentDays = (Array.isArray(accent) ? accent : accent ? [accent] : []).map((day) => moment(day).format("YYYY-MM-DD"));
    const weekdayFormat = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const columns = [];
    const end = moment(to);
    const day = moment(from);
    for (let i = 0; day.isSameOrBefore(end, "day") && i < maxColumns; i++, day.add(1, "day")) {
        const key = day.format("YYYY-MM-DD");
        columns.push({
            key,
            label: day.date(),
            subLabel: weekdayFormat.format(day.toDate()),
            variant: accentDays.includes(key)
                ? "accent"
                : key === today
                    ? "current"
                    : mutedWeekdays.includes(day.day())
                        ? "muted"
                        : "normal",
        });
    }
    if (columns.length === 0)
        // eslint-disable-next-line no-console
        console.warn(`buildDateColumns: range ${from}..${to} produced no columns — reversed or unparseable?`);
    else if (day.isSameOrBefore(end, "day"))
        // Silence here would read as "that is the whole range".
        // eslint-disable-next-line no-console
        console.warn(`buildDateColumns: range ${from}..${to} was truncated at ${maxColumns} columns`);
    return columns;
};
export default buildDateColumns;
