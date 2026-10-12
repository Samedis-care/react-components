import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type for strings that can be unset (null), e.g. backend fields without a default
 */
declare abstract class TypeStringNullable implements Type<string | null> {
    protected multiline: boolean;
    constructor(multiline?: boolean);
    abstract render(params: ModelRenderParams<string | null>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string | null;
    stringify(value: string | null): string;
}
export default TypeStringNullable;
