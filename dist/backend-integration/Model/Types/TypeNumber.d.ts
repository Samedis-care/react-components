import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type to handle numbers
 * @type number if set, null if not set
 */
declare abstract class TypeNumber implements Type<number | null> {
    abstract render(params: ModelRenderParams<number | null>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): number | null;
    stringify(value: number | null): string;
}
export default TypeNumber;
