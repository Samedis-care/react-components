import React from "react";
import TypeString from "../../TypeString";
import { TextFieldProps } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
export declare type ModelDataTypeStringRendererMUIParams = Omit<TextFieldProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error">;
/**
 * Renders a text field
 */
declare class RendererString extends TypeString {
    props?: ModelDataTypeStringRendererMUIParams;
    constructor(props?: ModelDataTypeStringRendererMUIParams);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererString;
