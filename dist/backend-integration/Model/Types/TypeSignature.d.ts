import React from "react";
import Type from "../Type";
import ModelRenderParams from "../RenderParams";
import FilterType from "../FilterType";
/**
 * A type to handle signatures (for electronic signing)
 * @remarks The value is the signature as PNG data URI, empty if not signed
 */
declare abstract class TypeSignature implements Type<string | null> {
    abstract render(params: ModelRenderParams<string | null>): React.ReactElement;
    validate(): string | null;
    getFilterType(): FilterType;
    getDefaultValue(): string | null;
    stringify(value: string | null): string;
}
export default TypeSignature;
