import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
import { EnumValue } from "./TypeEnum";
import { MultiSelectorData } from "../../../standalone";
export declare type AdvancedMultiEnumValue = Omit<MultiSelectorData, "label"> & Pick<EnumValue, "getLabel" | "invisible">;
/**
 * Enum type with multi-select capability
 */
declare abstract class TypeMultiEnum implements Type<string[]> {
    protected values: EnumValue[];
    constructor(values: EnumValue[]);
    abstract render(params: ModelRenderParams<string[]>): React.ReactElement;
    validate(values: string[]): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string[];
    stringify(values: string[]): string;
    getEnumValues: () => EnumValue[];
    deserialize: (value: unknown) => string[];
}
export default TypeMultiEnum;
