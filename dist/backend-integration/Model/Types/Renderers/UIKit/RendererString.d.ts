import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps } from "@mui/material";
import ModelRenderParams from "../../../RenderParams";
import { TextFieldWithHelpProps } from "../../../../../standalone/UIKit/TextFieldWithHelp";
import RendererStringNullable from "./RendererStringNullable";
export type ModelDataTypeStringRendererCCParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "autoFocus"> & Omit<TextFieldWithHelpProps, "warning">;
/**
 * Renders a text field
 */
declare class RendererString extends TypeString {
    props?: ModelDataTypeStringRendererCCParams;
    protected nullableRenderer: RendererStringNullable;
    constructor(props?: ModelDataTypeStringRendererCCParams);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererString;
