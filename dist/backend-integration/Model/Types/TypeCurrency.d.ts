import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type to handle currencies
 * @type [string (ISO 4217 3 letter code), number] | null if not set
 */
declare abstract class TypeCurrency implements Type<[string, number] | null> {
    abstract render(params: ModelRenderParams<[string, number] | null>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): [string, number] | null;
    stringify(value: [string, number] | null): string;
}
export default TypeCurrency;
