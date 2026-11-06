import React from "react";
import { ModelFieldDefinitionUnknown, ModelRenderParams, ModelUnknown } from "../../backend-integration";
import Type from "../../backend-integration/Model/Type";
type NonOverridableProps = "getDefaultValue" | "validate" | "filterable" | "sortable" | "columnWidth";
interface FieldProps {
    /**
     * The name of the field as specified in the model
     */
    name: string;
    /**
     * Overrides for the model information
     */
    overrides?: Partial<Omit<ModelFieldDefinitionUnknown, NonOverridableProps>> | ((original: ModelFieldDefinitionUnknown) => Omit<ModelFieldDefinitionUnknown, NonOverridableProps>);
    /**
     * Focus the field's control when it mounts, e.g. the field a form should start in
     * @remarks Like the `autoFocus` attribute: it applies when the control mounts, so
     *          turning it on for a control that is already shown does not move the
     *          focus. Only editable controls with a keyboard input take it; file and
     *          image uploads, the signature pad and the data grid multi select ignore it.
     */
    autoFocus?: boolean;
    /**
     * The id of the field's control, unique in the document
     * @remarks Default: an id generated for this FormField. The renderer gives it to the
     *          control the user operates (the input, the combobox of a selector, the group
     *          of a radio field or of a list of checkboxes), and the field's error or
     *          warning message gets the id `<id>-message`. Date and time fields, localized
     *          strings, file and image uploads, the signature pad, the tag selector and the
     *          data grid multi select do not use it yet.
     */
    id?: string;
    /**
     * The ids of elements that describe the field, separated by spaces, such as
     * instructions the page shows next to it
     * @remarks The control references them, followed by the field's error or warning
     *          message while one is shown. Default: none, so only the message describes the
     *          control. The selectors, and the controls `id` lists as not using it, do not
     *          take a description yet.
     */
    "aria-describedby"?: string;
}
export interface FormFieldContextType<T> extends ModelRenderParams<T> {
    type: Type<T>;
}
export declare const FormFieldContext: React.Context<FormFieldContextType<unknown> | null>;
export declare const useFormFieldContext: <T>() => FormFieldContextType<T>;
export declare const useFieldRelationModel: (fieldDef: ModelFieldDefinitionUnknown) => ModelUnknown | undefined;
declare const _default: React.MemoExoticComponent<(props: FieldProps) => React.ReactElement>;
export default _default;
