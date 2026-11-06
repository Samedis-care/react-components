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
declare const withAccessibleError: <P extends object>(hasValidationError: boolean, textFieldProps: P) => P;
export default withAccessibleError;
