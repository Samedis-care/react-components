import React from "react";
import { TextFieldProps } from "@mui/material";
import { ModelRenderParams } from "../../../index";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import TypeNumber from "../../TypeNumber";
export declare type ModelDataTypeDecimalRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "multiline"> & Omit<TextFieldWithHelpProps, "warning">;
/**
 * Renders a text field
 */
declare class RendererDecimal extends TypeNumber {
    props?: ModelDataTypeDecimalRendererCCParams;
    constructor(props?: ModelDataTypeDecimalRendererCCParams);
    render(params: ModelRenderParams<number | null>): React.ReactElement;
}
export default RendererDecimal;
