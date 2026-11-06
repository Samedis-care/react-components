import type { ModelFieldName, ModelUnknown } from "./Model";
import type Visibility from "./Visibility";
import type React from "react";
import { FormContextData } from "../../backend-components";
export interface RenderParams<T> {
    /**
     * The field the value belongs to
     */
    field: ModelFieldName;
    /**
     * The id of the field's control
     * @remarks Set by `FormField`: its `id` prop, else an id generated for the field, unique
     *          in the document. Give it to the element the user operates — the input, the
     *          checkbox, the group of a radio field or of several inputs — so labels and
     *          links can point to it.
     *          undefined where there is no form behind the control (data grid cells, import
     *          previews).
     */
    id?: string;
    /**
     * The id to give the element that shows `errorMsg` or `warningMsg`
     * @remarks Set by `FormField` (`<id>-message`). undefined where there is no form behind
     *          the control.
     */
    messageId?: string;
    /**
     * The control's `aria-describedby`: ids separated by spaces
     * @remarks The ids of `FormField`'s `aria-describedby`, followed by `messageId` while
     *          `errorMsg` or `warningMsg` is shown, so a screen reader reads the message when
     *          the user reaches the control. Give it to the element that gets `id`.
     *          undefined when nothing describes the control.
     */
    describedBy?: string;
    /**
     * The value to render
     */
    value: T;
    /**
     * The initial value (server side value)
     */
    initialValue: T;
    /**
     * The label of the field
     */
    label: string;
    /**
     * Has the field been touched before?
     */
    touched: boolean;
    /**
     * Should the field be marked as modified?
     * @remarks Display state rather than a diff of its own, and false unless the
     *          application asked for the marker: with `FormProps.showDirtyState` this is
     *          the form engine's per-field dirty state, which is independent of touched —
     *          a value set programmatically is dirty without the user ever having focused
     *          the field — and a `DirtyStateProvider` can set it to whatever the
     *          application means by modified instead. Always false where there is no form
     *          behind the control (data grid cells, import previews).
     */
    dirty: boolean;
    /**
     * Should the control take the focus as it mounts?
     * @remarks Set by `FormField`'s `autoFocus` prop, and true only while the field
     *          mounts: it turns false right after, so a control that remounts its input
     *          later does not take the focus again. Hand it to the control's own
     *          `autoFocus` in the editable branch, after any spread options, and render
     *          that input right away. A control with several inputs gives it to the one
     *          where typing starts, e.g. the empty entry at the end of a list. Always
     *          false where there is no form behind the control (data grid cells, import
     *          previews).
     */
    autoFocus: boolean;
    /**
     * The visibility to render the value at
     */
    visibility: Visibility;
    /**
     * The onChange handler for editable input fields
     */
    handleChange: (field: ModelFieldName, value: T) => void;
    /**
     * The onBlur handler for editable input fields
     */
    handleBlur: React.FocusEventHandler<HTMLElement>;
    /**
     * The error message or null if no error
     * @remarks While it is set, mark the control invalid: `error` on a MUI input or
     *          selector, which sets `aria-invalid` itself, else `aria-invalid` on the
     *          control, or on each input of a group that cannot take it (a fieldset).
     *          Render the message in the element with `messageId`.
     */
    errorMsg: string | null;
    /**
     * The warning/hint or null if no warning/hint
     * @remarks Shown where `errorMsg` is when there is no error, in the element with
     *          `messageId`; a warning does not make the control invalid.
     */
    warningMsg: string | null;
    /**
     * Function to set a new global form error
     * @param error The error to display
     */
    setError: (error: Error) => void;
    /**
     * Sets a field as touched (useful for forcing revalidation)
     * @param field The field to set touched
     * @param touched The new touched state
     * @param validate Should revalidate?
     */
    setFieldTouched: (field: ModelFieldName, touched?: boolean, validate?: boolean) => void;
    /**
     * Set a field value
     * @see FormContextData.setFieldValue
     */
    setFieldValue: FormContextData<ModelUnknown>["setFieldValue"];
    /**
     * If the given field has a relation and relation data was fetched while loading the form it can be accessed using this field
     */
    relationData?: Record<ModelFieldName, unknown>[];
    /**
     * The reference model from the model field definition
     */
    relationModel?: ModelUnknown;
    /**
     * Record values
     * @remarks Not always updated! Configure TypeSettings.updateHooks for your type
     */
    values: Record<string, unknown>;
}
export default RenderParams;
