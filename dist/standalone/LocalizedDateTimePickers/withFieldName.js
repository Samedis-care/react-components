/**
 * Names a picker's field for assistive technology, where it has no visible
 * label.
 *
 * MUI names the field group (`role="group"`, which holds the sections and
 * which a screen reader announces when focus enters a section) only after the
 * picker's `label`. Without one a screen reader says "Month, spin button" with
 * nothing telling what the date is for. This puts `name` on the group as its
 * `aria-label`, through `slotProps.input`. A visible label still names the
 * group (MUI's `aria-labelledby` wins), and an `aria-label` the caller set
 * there is kept. `calendarNameSlotProps` names the calendar.
 * @param textFieldProps The props for MUI's `textField` slot
 * @param name The picker's `aria-label`; undefined or empty for none
 * @returns The same props, with the name on the field group when there is one
 */
const withFieldName = (textFieldProps, name) => {
    if (!name)
        return textFieldProps;
    const slotProps = textFieldProps.slotProps ?? {};
    return {
        ...textFieldProps,
        slotProps: {
            ...slotProps,
            input: { "aria-label": name, ...slotProps.input },
        },
    };
};
export default withFieldName;
