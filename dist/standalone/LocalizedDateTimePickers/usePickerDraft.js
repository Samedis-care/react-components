import { useCallback, useState } from "react";
import { usePickerAdapter } from "@mui/x-date-pickers";
/**
 * Whether two picker values are the same, compared as MUI's own value manager
 * does: the same object, the same instant, or both an invalid date. The adapter
 * alone says an invalid date differs even from itself, which would make the
 * render-phase reset below fire on every render. `null` and an invalid date
 * stay different.
 * @param adapter The picker adapter
 * @param a One value
 * @param b The other value
 * @returns Whether the two are the same value
 */
const isSameValue = (adapter, a, b) => {
    if (a === b)
        return true;
    if (a != null && b != null && !adapter.isValid(a) && !adapter.isValid(b)) {
        return true;
    }
    return adapter.isEqual(a, b);
};
/**
 * Makes a controlled picker typable, by keeping what is being typed apart from
 * what gets reported upstream.
 *
 * The picker fields publish a value on **every** keystroke once all sections
 * hold something, so typing a year walks through `0002 → 0020 → 0202 → 2026`.
 * Each of those is a real date, which leaves a controlled consumer with no good
 * option: accepting them all commits — and in a filter refetches — three dates
 * the user never meant, while refusing them leaves `value` on the old date, which
 * makes the field re-sync its sections from it and swallow the keystroke, so the
 * year can never grow past its first digit.
 *
 * This hook takes the third option. The field renders from a local draft, so it
 * follows every keystroke and never reverts, while `onChange` only fires for a
 * value that passes the picker's own validation — and a half-typed year fails it,
 * the picker's default `minDate` being 1900-01-01. Clearing the field still
 * reports `null` immediately, an empty value being valid.
 *
 * An entry the picker rejects stays in the field, as in MUI's own field, also
 * once focus leaves it: marked invalid, with the picker's `onError` reporting
 * the error, until the user changes it, the consumer hands in another date, or
 * the calendar opens (`settle`). Handing in the date the consumer already holds,
 * as a form reset of a field whose value never changed does, is not another
 * date. Meanwhile the consumer holds the last value it accepted, so a consumer
 * that acts on the value checks `onError` first.
 *
 * What it cannot separate is an intermediate that is a plausible date in its own
 * right: retyping the day of a stored date reports the day passed through on the
 * way, because nothing distinguishes it from that day being meant.
 *
 * The draft doubles as the stable object the field wants: consumers derive
 * `value` with `moment(...)` during render and so hand us a fresh instance every
 * time, while the field compares its external value **by reference**. Holding the
 * draft keeps those section rebuilds from firing mid-entry.
 * @param value The value held by the consumer
 * @param onChange The consumer's change handler
 * @param publishIntermediateValues Escape hatch: report every keystroke instead,
 * i.e. the raw picker behaviour
 * @returns The value and handlers to hand to the picker
 */
const usePickerDraft = (value, onChange, publishIntermediateValues) => {
    const adapter = usePickerAdapter();
    // An uncontrolled picker renders from the field's own state, which nothing
    // reverts, so it needs no draft to render from — and handing it one would turn
    // it controlled mid-entry. Its `onChange` is still gated: a consumer listening
    // to an uncontrolled picker wants the same "a date the user entered" contract.
    const isControlled = value !== undefined;
    const holdsDraft = isControlled && !publishIntermediateValues;
    const [state, setState] = useState({
        draft: value ?? null,
        committed: value,
    });
    // The consumer's value now means a different moment in time than the one the
    // draft was typed over, so the draft is stale. Comparing by value rather than
    // by reference is what tolerates the `moment(...)`-in-render idiom (also for
    // an invalid date, `moment(null)` in render); deriving during render rather
    // than in an effect keeps the stale draft from being painted once first.
    if (holdsDraft &&
        !isSameValue(adapter, state.committed ?? null, value ?? null)) {
        setState({ draft: value ?? null, committed: value });
    }
    const handleChange = useCallback((newValue, context) => {
        if (publishIntermediateValues) {
            onChange?.(newValue, context);
            return;
        }
        // the field follows what was typed either way, so no keystroke is lost
        setState((prev) => ({ ...prev, draft: newValue }));
        if (context.validationError) {
            return;
        }
        setState((prev) => ({ ...prev, committed: newValue }));
        onChange?.(newValue, context);
    }, [onChange, publishIntermediateValues]);
    const settle = useCallback(() => {
        setState((prev) => ({ ...prev, draft: prev.committed ?? null }));
    }, []);
    return {
        value: holdsDraft ? state.draft : value,
        onChange: handleChange,
        settle,
    };
};
export default usePickerDraft;
