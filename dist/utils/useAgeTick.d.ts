/**
 * Re-renders the calling component whenever the age of a point in time can
 * have changed, so an age computed during render (with `timestampToAge`, e.g.
 * "5 minutes ago") advances while the component stays mounted.
 *
 * It re-renders on every whole second of the age while it is less than a
 * minute, then on every whole minute of it, also for a time in the future
 * (counting down). Ages in hours, days or longer change on whole minutes too,
 * and a timer that the browser delayed (a background tab, a computer that
 * slept) catches up within a minute.
 *
 * The timer starts on mount and whenever the time changes, not when only the
 * Date object does (a new Date of the same time on every render is fine), and
 * stops on unmount.
 * @param timestamp The point in time, as a Date or in milliseconds since the
 * epoch (e.g. `Date.now()`). `null`, `undefined` and an invalid time start no
 * timer.
 * @returns `Date.now()` as of the latest of these re-renders, or as of the
 * mount before the first one. Use it as a dependency of whatever has to follow
 * the clock, e.g. a `useMemo` that filters by age.
 * @remarks Keep the age text out of a live region: every change of it would be
 * announced.
 */
declare const useAgeTick: (timestamp: Date | number | null | undefined) => number;
export default useAgeTick;
