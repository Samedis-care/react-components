import React from "react";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import TypeNumber from "../../TypeNumber";
import { DecimalInputFieldProps } from "../../../../../standalone/UIKit/InputControls/DecimalInputField";
export type ModelDataTypeDecimalRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "multiline"> & Omit<DecimalInputFieldProps, "warning" | "value" | "onChange">;
/**
 * Renders a text field
 */
declare class RendererDecimal extends TypeNumber {
    props?: ModelDataTypeDecimalRendererCCParams;
    constructor(props?: ModelDataTypeDecimalRendererCCParams);
    render(params: ModelRenderParams<number | null>): React.ReactElement;
}
export default RendererDecimal;
