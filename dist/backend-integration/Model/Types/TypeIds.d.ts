import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type to handle an id array
 */
declare abstract class TypeIds implements Type<string[]> {
    abstract render(params: ModelRenderParams<string[]>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string[];
    stringify(value: string[]): string;
    deserialize: (value: unknown) => string[];
}
export default TypeIds;
