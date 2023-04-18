import React from "react";
import Type from "../Type";
import { ModelRenderParams } from "../index";
import FilterType from "../FilterType";
/**
 * Type for non-nullable dates
 */
declare abstract class TypeDate implements Type<Date> {
    protected error: string;
    abstract render(params: ModelRenderParams<Date>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): Date;
    stringify(value: Date): string;
    serialize: (value: Date) => unknown;
    deserialize: (value: unknown) => Date;
    /**
     * Formatting helper used in date renderers
     * @param value The user input
     * @returns The formatted value
     */
    static format: (value: string) => string;
}
export default TypeDate;
