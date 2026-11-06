import type { PickerOwnerState } from "@mui/x-date-pickers";
/**
 * Calls a picker field's `onBlur` once focus leaves the field, by any route.
 *
 * MUI's field calls the text field's `onBlur` whenever focus leaves the element
 * that holds the sections: also when it moves on to the open-picker button or
 * another adornment of the same field, and never when it later leaves from one
 * of those. This takes the `onBlur` off the text field props and calls it from
 * the blur of the field's input root (`role="group"`, which holds the sections
 * and the adornments) instead, only when focus goes somewhere outside it. The
 * open popup counts as part of the field: it takes focus when it opens and
 * hands it back to the field when it closes. Focus that leaves from inside the
 * open popup to another control (a click on it while the calendar is open) is
 * not seen, the popup not being part of the input root.
 *
 * The handler receives the root's focus event: `currentTarget` is the input
 * root, `target` the section or button that lost focus. A blur handler the
 * caller set on the input root (`slotProps.input.slotProps.root.onBlur`) is kept
 * and still sees every blur.
 * @param ownerState The owner state the picker resolves the `textField` slot
 * props with, for whether its popup is open
 * @param textFieldProps The props for MUI's `textField` slot
 * @returns The same props, with `onBlur` moved to the input root
 */
declare const withFieldBlur: <P extends object>(ownerState: PickerOwnerState, textFieldProps: P) => P;
export default withFieldBlur;
