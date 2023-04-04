import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type for non-nullable dates with time
 */
declare abstract class TypeDateTime implements Type<Date> {
    protected error: string;
    abstract render(params: ModelRenderParams<Date>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): Date;
    stringify(value: Date): string;
    serialize: (value: Date) => unknown;
    deserialize: (value: unknown) => Date;
}
export default TypeDateTime;
