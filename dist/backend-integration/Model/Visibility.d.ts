export interface Visibility {
    /**
     * Is the field disabled? (won't be rendered and won't be included in requests)
     */
    disabled: boolean;
    /**
     * Should the field not be rendered? (will still be included in requests)
     */
    hidden: boolean;
    /**
     * Is the field editable?
     */
    editable: boolean;
    /**
     * Is the field read-only? (only applies if editable)
     */
    readOnly: boolean;
    /**
     * Is the field required? Renderers mark it with MUI's `required`: an asterisk after the
     * label and, on most controls, a required input. The files, image and string list
     * renderers put the asterisk on their frame's title and describe the frame as "Required"
     * (GroupBox's `required`); a string list also requires its input for a new entry while
     * it has no entries.
     * @remarks Display only, like MUI's `required`: the form engine doesn't validate it, so a
     *          required field without a `validate` of its own can be saved empty. To refuse an
     *          empty value, give the field a validator next to the visibility, e.g.
     *          `validate: validatePresence`. Without one, the asterisk suits a field that may
     *          be saved incomplete, such as a draft that is checked when it is submitted.
     */
    required: boolean;
    /**
     * Is this field being rendered in a datagrid?
     */
    grid: boolean;
}
/**
 * Visibility Callback.
 * IMPORTANT: When using the function variation you need to handle:
 * - empty values and initialValues (when creating a new record)
 * - values matching initialValues (form submit, dirty check)
 * - values and initialValues correct (inside a form, for form fields)
 * A callback may disable its field for some values and enable it for others: the record keeps a value for
 * the field meanwhile (its default value in a new record, the loaded one in an existing record), a save
 * leaves it out while it is disabled, and a form renders and validates it once it is enabled.
 * Switching between hidden and not hidden has no such handling: a hidden field is still validated and saved.
 */
export type VisibilityCallback = Visibility | ((values: Record<string, unknown>, initialValues: Record<string, unknown>) => Visibility);
export declare const getVisibility: (cb: VisibilityCallback, values: Record<string, unknown>, initialValues: Record<string, unknown>) => Visibility;
export default Visibility;
