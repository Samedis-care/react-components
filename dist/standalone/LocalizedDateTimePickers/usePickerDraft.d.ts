import type { PickerChangeHandlerContext, PickerValidDate } from "@mui/x-date-pickers";
export type PickerDraftChangeHandler<TError> = (value: PickerValidDate | null, context: PickerChangeHandlerContext<TError>) => void;
export interface PickerDraftResult<TError> {
    /** The value to render the field from */
    value: PickerValidDate | null | undefined;
    /** The change handler to hand to the picker */
    onChange: PickerDraftChangeHandler<TError>;
    /**
     * Drops an unaccepted draft, so the field shows the date held back for the
     * consumer, or else the value the consumer holds, again. To be called from
     * the picker's `onOpen`: the calendar renders from the value it is given, so
     * a half-typed date would open it on a year nothing is selectable in.
     */
    settle: () => void;
    /**
     * The user is done with the field: the date held back is reported, if it
     * differs from the one reported last. To be called once focus leaves the
     * field and on Enter in it. Does nothing while `publishIntermediateValues` is
     * set.
     */
    finish: () => void;
    /**
     * Reports a date the calendar accepted (a day picked in the desktop
     * calendar, OK, the calendar closed with Escape or a click outside it), if
     * it differs from the one reported last. To be handed to the picker as its
     * `onAccept`; the field's changes, which MUI passes to `onAccept` as well,
     * are left for `finish`. While `publishIntermediateValues` is set it passes
     * everything to the consumer's `onAccept` as it comes, as MUI does.
     */
    accept: PickerDraftChangeHandler<TError>;
    /**
     * Empties the field from outside the picker: to be called when a control of
     * the caller's reports `null` to the consumer itself, as the touch Clear
     * button of the components-care text field does. The draft and a date held
     * back go, and `null` counts as reported.
     */
    clear: () => void;
}
/**
 * Makes a controlled picker typable, by keeping what is being typed apart from
 * what gets reported upstream, and reports a date only once the user is done
 * with it.
 *
 * The picker fields publish a value on **every** keystroke once all sections
 * hold something, so typing a year walks through `0002 → 0020 → 0202 → 2026`,
 * retyping the day of Aug 5 as `12` through Aug 1, retyping the minutes of 22:30
 * as `45` through 22:04, and deleting a section to retype it through `null`.
 * Most of those are real dates, which leaves a controlled consumer with no good
 * option: accepting them all commits — and in a filter refetches — dates the
 * user never meant, while refusing them leaves `value` on the old date, which
 * makes the field re-sync its sections from it and swallow the keystroke, so the
 * year can never grow past its first digit.
 *
 * This hook takes the third option. The field renders from a local draft, so it
 * follows every keystroke and never reverts, while `onChange` only fires once
 * the user is done with the field (`finish`: focus leaves it, Enter in it) or
 * the calendar accepts a date (`accept`), with the last value the picker
 * accepted, and only if that differs from the value reported last. A value the
 * picker accepts passes its own validation, which a half-typed year fails, the
 * picker's default `minDate` being 1900-01-01; an empty field is valid and
 * reported as `null`. A day picked in the mobile dialog waits for OK, and Cancel,
 * which hands the old date back, reports nothing.
 *
 * The consumer's `onAccept` gets each report too, right after `onChange` and
 * with the same arguments. MUI calls `onAccept` for every change of the field,
 * so it would get the half-typed and rejected dates that `onChange` is spared.
 *
 * An entry the picker rejects stays in the field, as in MUI's own field, also
 * once focus leaves it: marked invalid, with the picker's `onError` reporting
 * the error, until the user changes it, the consumer hands in another date, or
 * the calendar opens (`settle`). Nothing is reported for it, nor for the date
 * the picker accepted before it. Handing in the date the consumer already
 * holds, as a form reset of a field whose value never changed does, is not
 * another date. Handing it in another timezone is (a `moment.utc(...)` where it
 * was a `moment(...)`, as a "show in UTC" switch does): the field shows it in
 * that timezone from then on, and reports the dates the user enters in it.
 * Meanwhile the consumer holds the last value it accepted, so a consumer that
 * acts on the value checks `onError` first.
 *
 * The draft doubles as the stable object the field wants: consumers derive
 * `value` with `moment(...)` during render and so hand us a fresh instance every
 * time, while the field compares its external value **by reference**. Holding the
 * draft keeps those section rebuilds from firing mid-entry. A fresh instance of
 * the same instant in the same timezone keeps the held object.
 * @param value The value held by the consumer
 * @param onChange The consumer's change handler
 * @param publishIntermediateValues Escape hatch: report every change at once,
 * rejected ones included, i.e. the raw picker behaviour, to `onChange` and to
 * `onAccept`
 * @param defaultValue The initial value of an uncontrolled picker, which counts
 * as reported
 * @param onAccept The consumer's accept handler, called with every report
 * @returns The value and handlers to hand to the picker
 */
declare const usePickerDraft: <TError>(value: PickerValidDate | null | undefined, onChange: PickerDraftChangeHandler<TError> | undefined, publishIntermediateValues?: boolean, defaultValue?: PickerValidDate | null, onAccept?: PickerDraftChangeHandler<TError>) => PickerDraftResult<TError>;
export default usePickerDraft;
