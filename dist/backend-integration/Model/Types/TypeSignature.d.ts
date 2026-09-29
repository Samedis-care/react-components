import React from "react";
import Type from "../Type";
import ModelRenderParams from "../RenderParams";
import FilterType from "../FilterType";
/**
 * A type to handle signatures (for electronic signing)
 * @remarks The value is the signature as PNG data URI, empty if not signed
 */
declare abstract class TypeSignature implements Type<string> {
    abstract render(params: ModelRenderParams<string>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string;
    stringify(value: string): string;
}
export default TypeSignature;
