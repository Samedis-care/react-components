import accessSlotProps from "../../utils/internal/accessSlotProps";
/**
 * Tells assistive technology that a picker field is invalid, where a screen
 * reader looks for it, and says why in text under the field.
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
 *
 * MUI's validation itself is told only by the red outline, so while it decides
 * the error state (`error` unset) the message for its error, if given, is shown
 * as the helper text, in place of the caller's. A caller that sets `error`,
 * also to `false`, decides the state and its text itself.
 * @param hasValidationError Whether MUI's own validation rejects the value
 * shown, which is MUI's error state while `error` is unset
 * @param textFieldProps The props for MUI's `textField` slot, with the caller's
 * `error` already resolved
 * @param validationMessage What is wrong with the value according to MUI's
 * validation (see `usePickerErrorMessage`); `null` or left out for no message
 * @returns The same props, with the error state on the sections, the message
 * as the helper text and the live region on the helper text where they apply
 */
const withAccessibleError = (hasValidationError, textFieldProps, validationMessage) => {
    const { error, helperText: helperTextProp, slotProps: slotPropsProp, } = textFieldProps;
    const invalid = error ?? hasValidationError;
    const message = error === undefined ? validationMessage : null;
    const helperText = message ?? helperTextProp;
    if (!invalid && !helperText)
        return textFieldProps;
    const slotProps = slotPropsProp ?? {};
    let input = slotProps.input ?? {};
    let formHelperText = slotProps.formHelperText;
    if (invalid) {
        const sectionContent = input.slotProps?.sectionContent;
        input = {
            ...input,
            slotProps: {
                ...input.slotProps,
                sectionContent: (ownerState) => ({
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
        ...(message == null ? {} : { helperText: message }),
        slotProps: { ...slotProps, input, formHelperText },
    };
};
export default withAccessibleError;
