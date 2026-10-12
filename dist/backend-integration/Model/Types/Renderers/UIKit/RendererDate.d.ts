import React from "react";
import ModelRenderParams from "../../../RenderParams";
import TypeDate from "../../TypeDate";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";
import { RendererDateNullableProps } from "./RendererDateNullable";
export type RendererDateProps = RendererDateNullableProps;
/**
 * Renders a non-nullable Date with Date Selector
 */
declare class RendererDate extends TypeDate {
    props?: RendererDateProps;
    constructor(props?: RendererDateProps);
    render(params: ModelRenderParams<Date>): React.ReactElement;
    dataGridColumnSizingHint: () => IDataGridColumnDef["width"];
}
export default RendererDate;
