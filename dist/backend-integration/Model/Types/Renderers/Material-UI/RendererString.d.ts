import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
export type ModelDataTypeStringRendererMUIParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error">;
/**
 * Renders a text field
 */
declare class RendererString extends TypeString {
    props?: ModelDataTypeStringRendererMUIParams;
    constructor(props?: ModelDataTypeStringRendererMUIParams);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererString;
