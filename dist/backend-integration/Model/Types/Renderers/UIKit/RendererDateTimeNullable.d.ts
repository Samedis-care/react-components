import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeDateTimeNullable from "../../TypeDateTimeNullable";
/**
 * Renders Date with Date Selector
 */
declare class RendererDateTimeNullable extends TypeDateTimeNullable {
    render(params: ModelRenderParams<Date | null>): React.ReactElement;
}
export default RendererDateTimeNullable;
