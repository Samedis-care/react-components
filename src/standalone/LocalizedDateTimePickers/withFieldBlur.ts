import type React from "react";
import type { PickerOwnerState } from "@mui/x-date-pickers";

type FocusHandler = (event: React.FocusEvent<HTMLDivElement>) => void;

/** The part of the text field's slot props this helper reads and rewires */
interface TextFieldPropsWithBlur {
	onBlur?: FocusHandler;
	slotProps?: {
		input?: { slotProps?: { root?: { onBlur?: FocusHandler } } };
	};
}

/**
 * The class MUI puts on the root of a picker's desktop popup
 * (`pickerPopperClasses.root`)
 */
const POPPER_ROOT_SELECTOR = ".MuiPickerPopper-root";

/**
 * Whether focus, moving from inside a picker's field to `next`, leaves the picker.
 * @param field The field's input root, which holds the sections and the adornments
 * @param next Where focus goes (the event's `relatedTarget`), `null` for no element
 * @param ownerState The picker's owner state
 * @returns `false` while focus stays in the field or goes into its open popup
 */
const leavesPicker = (
	field: Element,
	next: EventTarget | null,
	ownerState: PickerOwnerState,
): boolean => {
	if (next instanceof Node && field.contains(next)) return false;
	if (!ownerState.isPickerOpen) return true;
	// the mobile dialog is modal: while it is open, focus can only go into it
	if (ownerState.pickerVariant === "mobile") return false;
	return !(next instanceof Element && next.closest(POPPER_ROOT_SELECTOR));
};

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
const withFieldBlur = <P extends object>(
	ownerState: PickerOwnerState,
	textFieldProps: P,
): P => {
	const { onBlur, slotProps: slotPropsProp } =
		textFieldProps as TextFieldPropsWithBlur;
	if (!onBlur) return textFieldProps;
	const slotProps = slotPropsProp ?? {};
	const input = slotProps.input ?? {};
	const root = input.slotProps?.root;
	return {
		...textFieldProps,
		onBlur: undefined,
		slotProps: {
			...slotProps,
			input: {
				...input,
				slotProps: {
					...input.slotProps,
					root: {
						...root,
						onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
							root?.onBlur?.(event);
							if (
								leavesPicker(
									event.currentTarget,
									event.relatedTarget,
									ownerState,
								)
							) {
								onBlur(event);
							}
						},
					},
				},
			},
		},
	};
};

export default withFieldBlur;
