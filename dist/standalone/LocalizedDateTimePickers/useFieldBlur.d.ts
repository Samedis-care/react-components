import type { PickerOwnerState } from "@mui/x-date-pickers";
/**
 * Wires a picker's `textField` slot props so that the field's `onBlur` is
 * called once focus leaves the field. See {@link useFieldBlur}.
 * @param ownerState The owner state the picker resolves the `textField` slot
 * props with, for whether its popup is open
 * @param textFieldProps The props for MUI's `textField` slot
 * @param onFieldFocus Called whenever an element of the field gets focus
 * @returns The same props, with `onBlur` moved to the input root, and
 * `onFieldFocus` called from it
 */
export type WithFieldBlur = <P extends object>(ownerState: PickerOwnerState, textFieldProps: P, onFieldFocus?: () => void) => P;
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
 * The mobile dialog is modal, so focus only leaves it by closing it.
 *
 * The handler receives the root's focus event: `currentTarget` is the input
 * root, `target` the section or button that lost focus. When focus leaves from
 * the popup, the event is made in that shape from the native `focusin` of the
 * element that got focus (`nativeEvent`): `target` is the element of the popup
 * that had focus, `relatedTarget` the element that got it. The `onBlur` of the
 * latest render is called. A blur handler the caller set on the input root
 * (`slotProps.input.slotProps.root.onBlur`) is kept and still sees every blur
 * of the root.
 *
 * `onFieldFocus`, if given, is called from the input root's focus, whenever
 * focus enters the field or moves within it; a focus handler the caller set on
 * the input root is kept.
 * @returns The function to resolve the `textField` slot props with, the same
 * for the life of the component
 */
declare const useFieldBlur: () => WithFieldBlur;
export default useFieldBlur;
