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
const calendarNameSlotProps = (slotProps, options) => {
    const { name, hasLabel, fallbackName } = options;
    if (hasLabel)
        return {};
    // MUI merges these slot props after its own, so an undefined
    // aria-labelledby replaces the one pointing at the title, and React leaves
    // the attribute out
    const calendarName = name
        ? { "aria-label": name, "aria-labelledby": undefined }
        : fallbackName
            ? { "aria-label": fallbackName }
            : undefined;
    if (!calendarName)
        return {};
    return {
        // MUI merges the popper's slot props into an object of its own, which
        // drops a function given there, so they are handed on as an object
        popper: { ...calendarName, ...slotProps?.popper },
        mobilePaper: { ...calendarName, ...slotProps?.mobilePaper },
    };
};
export default calendarNameSlotProps;
