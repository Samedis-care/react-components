import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeDateTime from "../../TypeDateTime";
/**
 * Renders a non-nullable Date with Date and Time Selector
 */
declare class RendererDateTime extends TypeDateTime {
    render(params: ModelRenderParams<Date>): React.ReactElement;
}
export default RendererDateTime;
