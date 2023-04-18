import React from "react";
import { ModelRenderParams } from "../../index";
import { MultiLanguageInputProps, MultiLanguageInputSupportedLanguages } from "../../../../standalone/UIKit/InputControls/MultiLanguageInput";
import TypeLocalizedString from "../TypeLocalizedString";
export declare type ModelDataTypeLocalizedStringRendererParams = Omit<MultiLanguageInputProps, "name" | "values" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "warning">;
/**
 * Renders a text field
 */
declare class RendererLocalizedString extends TypeLocalizedString {
    props: ModelDataTypeLocalizedStringRendererParams;
    constructor(props: ModelDataTypeLocalizedStringRendererParams);
    render(params: ModelRenderParams<Partial<Record<MultiLanguageInputSupportedLanguages, string>>>): React.ReactElement;
}
export default RendererLocalizedString;
