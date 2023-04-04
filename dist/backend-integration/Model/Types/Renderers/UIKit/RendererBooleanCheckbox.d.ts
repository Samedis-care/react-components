import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeBoolean from "../../TypeBoolean";
/**
 * Renders a TypeBoolean field as Checkbox
 */
declare class RendererBooleanCheckbox extends TypeBoolean {
    invert?: boolean;
    constructor(invert?: boolean);
    render(params: ModelRenderParams<boolean>): React.ReactElement;
}
export default RendererBooleanCheckbox;
