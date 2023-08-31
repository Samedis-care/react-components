import React from "react";
import { TextFieldProps } from "@mui/material";
import { ModelRenderParams } from "../../../index";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import TypeLocalizedString from "../../TypeLocalizedString";
import { MultiLanguageInputSupportedLanguages } from "../../../../../standalone/UIKit/InputControls/MultiLanguageInput";
export declare type ModelDataTypeStringLocalizedSingleRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error"> & Omit<TextFieldWithHelpProps, "warning">;
export declare const ModelDataTypeStringLocalizedSingleRendererContext: React.Context<MultiLanguageInputSupportedLanguages | null>;
/**
 * Renders a text field
 */
declare class RendererStringLocalizedSingle extends TypeLocalizedString {
    props?: ModelDataTypeStringLocalizedSingleRendererCCParams;
    constructor(props?: ModelDataTypeStringLocalizedSingleRendererCCParams);
    render(params: ModelRenderParams<Partial<Record<MultiLanguageInputSupportedLanguages, string>>>): React.ReactElement;
}
export default RendererStringLocalizedSingle;
