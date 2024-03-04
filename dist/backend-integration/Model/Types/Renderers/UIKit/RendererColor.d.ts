import React from "react";
import ModelRenderParams from "../../../RenderParams";
import { ColorInputProps } from "../../../../../standalone/UIKit/InputControls/ColorInput";
import TypeColor from "../../TypeColor";
export type ModelDataTypeColorRenderer = Omit<ColorInputProps, "name" | "value" | "label" | "disabled" | "required" | "onChange" | "onBlur" | "error" | "warning">;
/**
 * Renders a text field
 */
declare class RendererColor extends TypeColor {
    props?: ModelDataTypeColorRenderer;
    constructor(props?: ModelDataTypeColorRenderer);
    render(params: ModelRenderParams<string>): React.ReactElement;
}
export default RendererColor;
