/**
 * Tells assistive technology that a picker field is required.
 *
 * MUI's field passes `required` to the hidden input, which is `aria-hidden`,
 * and the label's asterisk is `aria-hidden` too, while the field group's role
 * cannot carry `aria-required`. So a screen reader never hears "required".
 * This puts `aria-required` on every section (`role="spinbutton"`), the element
 * that has focus while the user types, through
 * `slotProps.input.slotProps.sectionContent`. Section content props the caller
 * already set there (an object or a function) are kept and win.
 * @param textFieldProps The props for MUI's `textField` slot, with `required`
 * already resolved
 * @returns The same props, with the required state on the sections when
 * `required` is set
 */
declare const withRequiredSections: <P extends object>(textFieldProps: P) => P;
export default withRequiredSections;
