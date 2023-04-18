import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
export interface EnumValue {
    value: string;
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
declare abstract class TypeEnum implements Type<string> {
    protected values: EnumValue[];
    protected numericMode: boolean;
    constructor(values: EnumValue[], numericMode?: boolean);
    abstract render(params: ModelRenderParams<string>): React.ReactElement;
    validate(value: string): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string;
    stringify(value: string): string;
    deserialize: (value: unknown) => string;
    serialize: (value: string) => string | number | null;
    getEnumValues: () => EnumValue[];
}
export default TypeEnum;
