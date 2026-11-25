import type { PickerOwnerState } from "@mui/x-date-pickers";
/**
 * What {@link WithFieldBlur} needs besides the slot props
 */
export interface FieldBlurOptions {
    /**
     * The picker's `name` prop. MUI passes it to the text field itself, so it is
     * not among the slot props; a `name` in the slot props takes precedence, as
     * in MUI.
     */
    name?: string;
    /** Called whenever an element of the field gets focus */
    onFieldFocus?: () => void;
}
/**
 * Wires a picker's `textField` slot props so that the field's `onBlur` is
 * called once focus leaves the field, with an event that names the field. See
 * {@link useFieldBlur}.
 * @param ownerState The owner state the picker resolves the `textField` slot
 * props with, for whether its popup is open
 * @param textFieldProps The props for MUI's `textField` slot
 * @param options The field's name, and a focus callback
 * @returns The same props, with `onBlur` moved to the input root, the name as
 * the input root's `data-name`, `onFieldFocus` called from the input root, and
 * a ref on the input root
 */
export type WithFieldBlur = <P extends object>(ownerState: PickerOwnerState, textFieldProps: P, options?: FieldBlurOptions) => P;
/**
 * Calls a picker field's `onBlur` once focus leaves the field, by any route.
 *
 * MUI's field calls the text field's `onBlur` whenever focus leaves the element
 * that holds the sections: also when it moves on to the open-picker button or
 * another adornment of the same field, and never when it later leaves from one
 * of those. The function this returns takes the `onBlur` off the text field
 * props and calls it from the blur of the field's input root (`role="group"`,
 * which holds the sections and the adornments) instead, only when focus goes
 * somewhere outside it.
 *
 * The open popup counts as part of the field: it takes focus when it opens and
 * hands it back to the field when it closes. Focus that leaves from inside the
 * open desktop popup for another element (a click on another control while the
 * calendar is open) calls `onBlur` too, once that element gets focus; focus
 * that goes to no element meanwhile (the window losing focus) is not leaving.
 * That holds however the popup was opened: a controlled `open` that opens it
 * while focus is outside the field, too. When such a popup closes, it hands
 * focus back to the element that had it, which is leaving as well.
 * The mobile dialog is modal, so focus only leaves it by closing it.
 *
 * The handler receives the root's focus event: `currentTarget` is the input
 * root, `target` the section or button that lost focus. The input root carries
 * the field's name as `data-name` (unless the caller set one on it), so a
 * handler that reads the field from the event, as Form's `handleBlur` does,
 * finds it there; the name itself sits on the hidden input, which never has
 * focus. When focus leaves from
 * the popup, the event is made in that shape from the native `focusin` of the
 * element that got focus (`nativeEvent`): `target` is the element of the popup
 * that had focus, `relatedTarget` the element that got it. The `onBlur` of the
 * latest render is called. A blur handler the caller set on the input root
 * (`slotProps.input.slotProps.root.onBlur`) is kept and still sees every blur
 * of the root, and so is a ref the caller set there.
 *
 * `options.onFieldFocus`, if given, is called from the input root's focus, whenever
 * focus enters the field or moves within it; a focus handler the caller set on
 * the input root is kept.
 * @returns The function to resolve the `textField` slot props with, the same
 * for the life of the component
 */
declare const useFieldBlur: () => WithFieldBlur;
export default useFieldBlur;
