/**
 * Rebuilds a date from its local parts, interpreted as UTC
 * @param date A date
 * @returns The date with its local parts moved to UTC
 * @deprecated For date-only values use `normalizeDate` instead — this anchors at
 * UTC midnight, which reads back as the previous day in every timezone behind
 * UTC. See src/utils/dateOnlyUtils.ts for the date-only value contract.
 */
declare const localDateToUtcDate: (date: Date) => Date;
export default localDateToUtcDate;
