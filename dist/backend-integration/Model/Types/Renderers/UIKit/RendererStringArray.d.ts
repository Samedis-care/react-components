import React from "react";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import TypeStringArray from "../../TypeStringArray";
export type ModelDataTypeStringArrayRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "multiline" | "placeholder" | "disabled" | "required" | "onChange" | "onBlur" | "error"> & Omit<TextFieldWithHelpProps, "warning">;
/**
 * Renders text fields inside a group box
 */
declare class RendererStringArray extends TypeStringArray {
    props?: ModelDataTypeStringArrayRendererCCParams;
    constructor(props?: ModelDataTypeStringArrayRendererCCParams);
    render(params: ModelRenderParams<string[]>): React.ReactElement;
}
export default RendererStringArray;
