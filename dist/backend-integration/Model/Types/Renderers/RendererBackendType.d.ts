import React from "react";
import ModelRenderParams from "../../RenderParams";
import Type from "../../Type";
import FilterType from "../../FilterType";
/**
 * No-op renderer
 */
declare class RendererBackendType<T> implements Type<T> {
    validate(): string | Promise<string | null> | null;
    getFilterType(): FilterType;
    getDefaultValue(): T;
    stringify(value: T): string;
    render(params: ModelRenderParams<T>): React.ReactElement;
}
export default RendererBackendType;
