import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeDate from "../../TypeDate";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";
/**
 * Renders Date with Date Selector
 */
declare class RendererDate extends TypeDate {
    render(params: ModelRenderParams<Date>): React.ReactElement;
    dataGridColumnSizingHint: () => IDataGridColumnDef["width"];
}
export default RendererDate;
