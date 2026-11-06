import type {
	PickerOwnerState,
	PickersInputBaseProps,
} from "@mui/x-date-pickers";
import accessSlotProps from "../../utils/internal/accessSlotProps";

type SectionContentSlotProps = NonNullable<
	PickersInputBaseProps["slotProps"]
>["sectionContent"];

/** The part of the text field's props this helper reads and extends */
interface TextFieldPropsWithError {
	error?: boolean;
	helperText?: unknown;
	slotProps?: {
		input?: {
			"aria-live"?: string;
			slotProps?: { sectionContent?: SectionContentSlotProps };
		};
		formHelperText?: object;
	};
}

/**
 * Tells assistive technology that a picker field is invalid, where a screen
 * reader looks for it.
 *
 * MUI marks only the field group `aria-invalid`, and a screen reader does not
 * announce the group's state while focus is inside it, so a user typing a year
 * the picker rejects hears "Year, spin button, 1999" and nothing else. This puts
 * `aria-invalid` on every section (`role="spinbutton"`), the element that has
 * focus while the user types, through `slotProps.input.slotProps.sectionContent`.
 * Section content props the caller already set there (an object or a function)
 * are kept and win.
 *
 * While a helper text is shown, MUI also makes the group a live region, which
 * re-announces the field on every keystroke, while the helper text, which sits
 * outside the group, is never announced when it changes. So the live region is
 * moved to the helper text, where a changed message, such as an error, is read
 * out. An `aria-live` the caller set on either is kept.
 * @param hasValidationError Whether MUI's own validation rejects the value
 * shown, which is MUI's error state while `error` is unset
 * @param textFieldProps The props for MUI's `textField` slot, with the caller's
 * `error` already resolved
 * @returns The same props, with the error state on the sections and the live
 * region on the helper text where they apply
 */
const withAccessibleError = <P extends object>(
	hasValidationError: boolean,
	textFieldProps: P,
): P => {
	const {
		error,
		helperText,
		slotProps: slotPropsProp,
	} = textFieldProps as TextFieldPropsWithError;
	const invalid = error ?? hasValidationError;
	if (!invalid && !helperText) return textFieldProps;

	const slotProps = slotPropsProp ?? {};
	let input = slotProps.input ?? {};
	let formHelperText = slotProps.formHelperText;
	if (invalid) {
		const sectionContent = input.slotProps?.sectionContent;
		input = {
			...input,
			slotProps: {
				...input.slotProps,
				sectionContent: (ownerState: PickerOwnerState) => ({
					"aria-invalid": true,
					...accessSlotProps(ownerState, sectionContent),
				}),
			},
		};
	}
	if (helperText) {
		input = { "aria-live": undefined, ...input };
		formHelperText = { "aria-live": "polite", ...formHelperText };
	}
	return {
		...textFieldProps,
		slotProps: { ...slotProps, input, formHelperText },
	};
};

export default withAccessibleError;
