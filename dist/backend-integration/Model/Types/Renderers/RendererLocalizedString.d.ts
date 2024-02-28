import React from "react";
import { ModelRenderParams } from "../../index";
import { MultiLanguageInputProps, MultiLanguageInputSupportedLanguages } from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
import { TypeSettings } from "../../Type";
export type ModelDataTypeLocalizedStringRendererGetFallbackLabel = (value: Partial<Record<MultiLanguageInputSupportedLanguages, string>>, values: Record<string, unknown>) => string;
export interface ModelDataTypeLocalizedStringRendererParamsExtra {
    /**
     * fallback label for data-grid view
     */
    getFallbackLabel?: ModelDataTypeLocalizedStringRendererGetFallbackLabel;
    /**
     * Values used in getFallbackLabel
     * @see TypeSettings.updateHooks
     */
    getFallbackLabelValues?: string[];
}
export type ModelDataTypeLocalizedStringRendererParams = Omit<MultiLanguageInputProps, "name" | "values" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "warning"> & ModelDataTypeLocalizedStringRendererParamsExtra;
/**
 * Renders a text field
 */
declare class RendererLocalizedString extends TypeLocalizedString {
    props: Omit<ModelDataTypeLocalizedStringRendererParams, keyof ModelDataTypeLocalizedStringRendererParamsExtra>;
    settings: TypeSettings;
    extra: ModelDataTypeLocalizedStringRendererParamsExtra;
    constructor(props: ModelDataTypeLocalizedStringRendererParams);
    render(params: ModelRenderParams<Partial<Record<MultiLanguageInputSupportedLanguages, string>>>): React.ReactElement;
}
export default RendererLocalizedString;
