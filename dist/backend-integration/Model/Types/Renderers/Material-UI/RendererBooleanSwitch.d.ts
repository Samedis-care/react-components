import React from "react";
import { SwitchProps } from "@material-ui/core";
import { ModelRenderParams } from "../../../index";
import TypeBoolean from "../../TypeBoolean";
export interface ModelDataTypeBooleanSwitchRendererMUIProps {
    switchProps: Omit<SwitchProps, "name" | "checked" | "disabled" | "onChange" | "onBlur">;
}
/**
 * Renders a TypeBoolean field as Switch
 */
declare class RendererBooleanSwitch extends TypeBoolean {
    invert?: boolean;
    props?: ModelDataTypeBooleanSwitchRendererMUIProps;
    constructor(invert?: boolean, props?: ModelDataTypeBooleanSwitchRendererMUIProps);
    render(params: ModelRenderParams<boolean>): React.ReactElement;
}
export default RendererBooleanSwitch;
