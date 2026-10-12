import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { EnumValue } from "./TypeEnum";
import { MultiSelectorData } from "../../../standalone";
export type AdvancedMultiEnumValue<T extends string = string> = Omit<MultiSelectorData, "label" | "value"> & Pick<EnumValue<T>, "value" | "getLabel" | "invisible">;
/**
 * Enum type with multi-select capability
 */
declare abstract class TypeMultiEnum<T extends string = string> implements Type<T[]> {
    protected values: EnumValue<T>[];
    constructor(values: EnumValue<T>[]);
    abstract render(params: ModelRenderParams<T[]>): React.ReactElement;
    validate(values: T[]): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): T[];
    stringify(values: T[]): string;
    getEnumValues: () => EnumValue<T>[];
    deserialize: (value: unknown) => T[];
}
export default TypeMultiEnum;
