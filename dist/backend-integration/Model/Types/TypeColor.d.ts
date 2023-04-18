import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type to handle (hex string) colors
 */
declare abstract class TypeColor implements Type<string> {
    abstract render(params: ModelRenderParams<string>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string;
    stringify(value: string): string;
}
export default TypeColor;
