import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type to handle an id
 */
declare abstract class TypeId implements Type<string | null> {
    abstract render(params: ModelRenderParams<string | null>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string | null;
    stringify(value: string | null): string;
}
export default TypeId;
