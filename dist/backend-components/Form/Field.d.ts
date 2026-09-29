import React from "react";
import { ModelFieldDefinition, ModelRenderParams, PageVisibility } from "../../backend-integration";
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
    overrides?: Partial<Omit<ModelFieldDefinition<unknown, string, PageVisibility, never>, NonOverridableProps>> | ((original: ModelFieldDefinition<unknown, string, PageVisibility, never>) => Omit<ModelFieldDefinition<unknown, string, PageVisibility, never>, NonOverridableProps>);
    /**
     * Focus the field's control when it mounts, e.g. the field a form should start in
     * @remarks Like the `autoFocus` attribute: it applies when the control mounts, so
     *          turning it on for a control that is already shown does not move the
     *          focus. Only editable controls with a keyboard input take it; file and
     *          image uploads, the signature pad and the data grid multi select ignore it.
     */
    autoFocus?: boolean;
}
export interface FormFieldContextType<T> extends ModelRenderParams<T> {
    type: Type<T>;
}
export declare const FormFieldContext: React.Context<FormFieldContextType<unknown> | null>;
export declare const useFormFieldContext: <T>() => FormFieldContextType<T>;
export declare const useFieldRelationModel: (fieldDef: ModelFieldDefinition<unknown, string, PageVisibility, never>) => import("../..").Model<string, PageVisibility, unknown> | undefined;
declare const _default: React.MemoExoticComponent<(props: FieldProps) => React.ReactElement>;
export default _default;
