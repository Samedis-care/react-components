import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
export type ModelDataTypeStringRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error"> & Omit<TextFieldWithHelpProps, "warning">;
/**
 * Renders a text field
 */
declare class RendererString extends TypeString {
    props?: ModelDataTypeStringRendererCCParams;
    constructor(props?: ModelDataTypeStringRendererCCParams);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererString;
