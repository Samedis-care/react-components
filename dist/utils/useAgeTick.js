import { useEffect, useState } from "react";
const SECOND = 1000;
const MINUTE = 60 * SECOND;
/**
 * How long until the age of a point in time, counted in whole seconds while
 * it is below a minute and in whole minutes from then on, changes next
 * @param time The point in time, in milliseconds since the epoch
 * @param now The current time, in milliseconds since the epoch
 * @returns The delay in milliseconds, from 1 up to a minute
 */
const msUntilAgeChanges = (time, now) => {
    const age = now - time;
    const distance = Math.abs(age);
    const step = distance < MINUTE ? SECOND : MINUTE;
    // A past time grows into its next whole step. The distance to a future time
    // shrinks, and its whole steps drop by one just after it reaches a multiple
    // of the step.
    return age >= 0 ? step - (age % step) : (distance % step) + 1;
};
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
const useAgeTick = (timestamp) => {
    const time = timestamp == null ? NaN : new Date(timestamp).getTime();
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        if (!Number.isFinite(time))
            return;
        let handle;
        const schedule = () => {
            handle = window.setTimeout(() => {
                setNow(Date.now());
                schedule();
            }, msUntilAgeChanges(time, Date.now()));
        };
        schedule();
        return () => window.clearTimeout(handle);
    }, [time]);
    return now;
};
export default useAgeTick;
