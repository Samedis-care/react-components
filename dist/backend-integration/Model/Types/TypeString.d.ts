import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type to handle strings
 */
declare abstract class TypeString implements Type<string> {
    protected multiline: boolean;
    constructor(multiline?: boolean);
    abstract render(params: ModelRenderParams<string>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string;
    stringify(value: string): string;
}
export default TypeString;
