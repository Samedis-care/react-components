import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeDateNullable from "../../TypeDateNullable";
import { DateInput } from "../../../../../standalone";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";
export type RendererDateNullableProps = Omit<Parameters<typeof DateInput>[0], "name" | "value" | "label" | "disabled" | "onChange" | "onBlur" | "error" | "onError" | "fullWidth" | "clearable">;
/**
 * Renders Date with Date Selector
 */
declare class RendererDateNullable extends TypeDateNullable {
    props?: RendererDateNullableProps;
    constructor(props?: RendererDateNullableProps);
    render(params: ModelRenderParams<Date | null>): React.ReactElement;
    dataGridColumnSizingHint: () => IDataGridColumnDef["width"];
}
export default RendererDateNullable;
