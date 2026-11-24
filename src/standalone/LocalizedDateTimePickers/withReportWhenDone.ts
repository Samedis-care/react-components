import type React from "react";
import type { PickerDraftResult } from "./usePickerDraft";

/** The part of the text field's slot props this helper reads and rewires */
interface TextFieldPropsWhenDone {
	onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
	onKeyDown?: React.KeyboardEventHandler<HTMLElement>;
	/** The touch Clear button of the components-care text field */
	customHandleClear?: () => void;
}

/**
 * Wires a picker's `textField` slot props to report the date once the user is
 * done with the field, see `usePickerDraft`:
 *
 * - `onBlur` calls `finish` first. To be resolved before `useFieldBlur`, which
 *   calls `onBlur` once focus leaves the field, by any route.
 * - Enter in a section calls `finish`, before an `onKeyDown` the caller set.
 *   Enter that ends an IME composition does not. MUI calls the field's
 *   `onKeyDown` for the sections only, so Enter on a button of the field (the
 *   open-picker button, the touch Clear) does not either.
 * - A `customHandleClear` the caller set (the touch Clear button of the
 *   components-care text field, which reports `null` to the consumer itself)
 *   calls `clear` first, so the field drops what was typed and a date held
 *   back with it, also when the consumer already holds `null`.
 * @param textFieldProps The props for MUI's `textField` slot
 * @param draft The picker's draft
 * @returns The same props, with `onBlur`, `onKeyDown` and `customHandleClear`
 * wrapped
 */
const withReportWhenDone = <P extends object>(
	textFieldProps: P,
	draft: Pick<PickerDraftResult<unknown>, "finish" | "clear">,
): P => {
	const { finish, clear } = draft;
	const { onBlur, onKeyDown, customHandleClear } =
		textFieldProps as TextFieldPropsWhenDone;
	return {
		...textFieldProps,
		onBlur: (event: React.FocusEvent<HTMLElement>) => {
			finish();
			onBlur?.(event);
		},
		onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => {
			if (event.key === "Enter" && !event.nativeEvent.isComposing) finish();
			onKeyDown?.(event);
		},
		...(customHandleClear && {
			customHandleClear: () => {
				clear();
				customHandleClear();
			},
		}),
	};
};

export default withReportWhenDone;
