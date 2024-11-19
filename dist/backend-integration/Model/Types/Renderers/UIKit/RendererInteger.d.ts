import React from "react";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import TypeNumber from "../../TypeNumber";
import { IntegerInputFieldProps } from "../../../../../standalone/UIKit/InputControls/IntegerInputField";
export type ModelDataTypeIntegerRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "multiline"> & Omit<IntegerInputFieldProps, "warning" | "onChange" | "value">;
/**
 * Renders a text field
 */
declare class RendererInteger extends TypeNumber {
    props?: ModelDataTypeIntegerRendererCCParams;
    constructor(props?: ModelDataTypeIntegerRendererCCParams);
    render(params: ModelRenderParams<number | null>): React.ReactElement;
}
export default RendererInteger;
