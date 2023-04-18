import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type for booleans
 */
declare abstract class TypeBoolean implements Type<boolean> {
    abstract render(params: ModelRenderParams<boolean>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): boolean;
    stringify(value: boolean): string;
}
export default TypeBoolean;
