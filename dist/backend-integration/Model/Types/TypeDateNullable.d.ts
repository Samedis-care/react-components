import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type for nullable dates
 */
declare abstract class TypeDateNullable implements Type<Date | null> {
    protected error: string;
    abstract render(params: ModelRenderParams<Date | null>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): Date | null;
    stringify(value: Date | null): string;
    serialize: (value: Date | null) => unknown;
    deserialize: (value: unknown) => Date | null;
}
export default TypeDateNullable;
