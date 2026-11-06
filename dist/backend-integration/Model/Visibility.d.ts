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
     * Is required field?
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
