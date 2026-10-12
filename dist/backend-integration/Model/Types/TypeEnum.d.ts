import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
export interface EnumValue<T extends string = string> {
    value: T;
    getLabel: () => string;
    invisible?: boolean;
    /**
     * Hide the entry in as grid filter enum selection (overwrites invisible)
     * @default to value of invisible
     */
    invisibleInGridFilter?: boolean;
    disabled?: boolean;
    isDivider?: boolean;
}
/**
 * Type for enums: the value is one of the values. An enum that can be empty declares `""` as a
 * value (`TypeEnum<X | "">`), nothing adds it implicitly.
 */
declare abstract class TypeEnum<T extends string = string> implements Type<T> {
    protected values: EnumValue<T>[];
    protected defaultValue: T;
    protected numericMode: boolean;
    /**
     * @param values The values
     * @param defaultValue The value of a new record: one of the values, or `""` for an enum that
     * declares it, which then starts empty
     * @param numericMode Send the values to the server as numbers
     */
    constructor(values: EnumValue<T>[], defaultValue: NoInfer<T>, numericMode?: boolean);
    abstract render(params: ModelRenderParams<T>): React.ReactElement;
    validate(value: T): string | null;
    getFilterType(): FilterType;
    getDefaultValue: () => T;
    stringify(value: T): string;
    deserialize: (value: unknown) => T;
    serialize: (value: T) => string | number | null;
    getEnumValues: () => EnumValue<T>[];
}
export default TypeEnum;
