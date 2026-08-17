import React from "react";
import type { PickerChangeHandlerContext, PickerValidDate } from "@mui/x-date-pickers";
export type PickerDraftChangeHandler<TError> = (value: PickerValidDate | null, context: PickerChangeHandlerContext<TError>) => void;
export interface PickerDraftResult<TError> {
    /** The value to render the field from */
    value: PickerValidDate | null | undefined;
    /** The change handler to hand to the picker */
    onChange: PickerDraftChangeHandler<TError>;
    /**
     * To be called from the text field's `onBlur`, alongside whatever the consumer
     * passed. Settles the draft once focus really leaves the field, and ignores
     * focus moves within it.
     */
    settleOnBlur: (event: React.FocusEvent<Element>) => void;
    /**
     * Drops an unaccepted draft. To be called from the picker's `onOpen`: the
     * calendar renders from the value it is given, so a half-typed date would open
     * it on a year nothing is selectable in.
     */
    settle: () => void;
}
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
declare const usePickerDraft: <TError>(value: PickerValidDate | null | undefined, onChange: PickerDraftChangeHandler<TError> | undefined, publishIntermediateValues?: boolean) => PickerDraftResult<TError>;
export default usePickerDraft;
