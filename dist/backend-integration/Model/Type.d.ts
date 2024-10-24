import type React from "react";
import type ModelRenderParams from "./RenderParams";
import type FilterType from "./FilterType";
import type { EnumValue } from "./Types/TypeEnum";
import type { IDataGridColumnDef } from "../../standalone/DataGrid/DataGrid";
import { ModelFieldDefinition, PageVisibility } from "./Model";
export interface TypeSettings {
    /**
     * Additional field changes which cause re-render
     */
    updateHooks?: string[];
}
export interface Type<T> {
    /**
     * Validates the given value
     * @param value The value to verify
     * @param field The field that's being validated
     * @returns An error string or null if no validation error occurred
     */
    validate(value: T, field: ModelFieldDefinition<T, string, PageVisibility, unknown>): Promise<string | null> | string | null;
    /**
     * Validate the given value for hints
     * @param value The value to verify
     * @param field The field that's being validated
     * @returns An warning string or null if no validation warning occurred
     */
    validateHint?: (value: T, field: ModelFieldDefinition<T, string, PageVisibility, unknown>) => Promise<string | null> | string | null;
    /**
     * Renders the value
     * @param params The render parameters
     */
    render(params: ModelRenderParams<T>): React.ReactElement;
    /**
     * Gets the filter type for grid sorting
     */
    getFilterType(): FilterType;
    /**
     * Gets the default value for the type
     * @returns an empty value or null
     */
    getDefaultValue(): T;
    /**
     * Turns value into string
     * @param value The value to stringify
     */
    stringify(value: T): string;
    /**
     * Optional serialization handler. Turns value into a JSON serializable value.
     * @param value The raw value
     * @returns The JSON serializable value
     */
    serialize?: (value: T) => unknown | Promise<unknown>;
    /**
     * Optional deserialization handler. Turns value into a raw value
     * @param value The JSON serialized value
     * @returns The raw value (of type T)
     */
    deserialize?: (value: unknown) => T | Promise<T>;
    /**
     * Get enum values
     */
    getEnumValues?: () => EnumValue[];
    /**
     * Initial size info for data grid
     */
    dataGridColumnSizingHint?: IDataGridColumnDef["width"] | (() => IDataGridColumnDef["width"]);
    /**
     * Renderer settings
     */
    settings?: TypeSettings;
}
export default Type;
