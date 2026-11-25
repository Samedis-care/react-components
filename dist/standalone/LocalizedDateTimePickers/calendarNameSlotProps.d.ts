/** The part of a picker's slot props this helper reads and extends */
interface CalendarSlotProps {
    popper?: object;
    mobilePaper?: object;
}
/** How {@link calendarNameSlotProps} names a picker's calendar */
export interface CalendarNameOptions {
    /**
     * The picker's `aria-label`, the name of its field; undefined or empty for
     * none
     */
    name: string | undefined;
    /**
     * Whether the picker has a visible `label`; MUI names its calendar then,
     * and `name` is not used
     */
    hasLabel: boolean;
    /**
     * The name for the calendar of a picker with neither a `label` nor a
     * `name`: MUI's title of the mobile dialog ("Select date"), in the
     * picker's language
     */
    fallbackName: string | undefined;
}
/**
 * Names a picker's open calendar for assistive technology, after its field.
 *
 * MUI labels the calendar (`role="dialog"`) by the picker's `label` where the
 * calendar shows no title, and by the title where it shows one, as the mobile
 * dialog does by default ("Select date"). A picker without a label opens an
 * unnamed desktop popup. This names the popup (`slotProps.popper`) and the
 * mobile dialog (`slotProps.mobilePaper`):
 * - for a picker without a label but with a `name` (its `aria-label`, see
 *   `withFieldName`), after that name, also where the calendar shows a title,
 *   so the calendars of two such pickers ("From", "To") differ;
 * - for a picker with neither, after `fallbackName`, where the calendar shows
 *   no title, so it is never an unnamed dialog.
 *
 * A labelled picker's calendar is left to MUI. An `aria-label` or
 * `aria-labelledby` the caller set in one of these slot props is kept.
 * @param slotProps The picker's slot props, as the caller gave them
 * @param options The field's name, and what to fall back to
 * @returns The `popper` and `mobilePaper` slot props with the name, to spread
 * into the picker's slot props; none for a labelled picker
 */
declare const calendarNameSlotProps: (slotProps: CalendarSlotProps | undefined, options: CalendarNameOptions) => CalendarSlotProps;
export default calendarNameSlotProps;
