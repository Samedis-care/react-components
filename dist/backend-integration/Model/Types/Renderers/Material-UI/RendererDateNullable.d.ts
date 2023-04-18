import React from "react";
import { ModelRenderParams } from "../../../index";
import TypeDateNullable from "../../TypeDateNullable";
import { IDataGridColumnDef } from "../../../../../standalone/DataGrid/DataGrid";
/**
 * Renders Date with Date Selector
 */
declare class RendererDateNullable extends TypeDateNullable {
    render(params: ModelRenderParams<Date | null>): React.ReactElement;
    dataGridColumnSizingHint: () => IDataGridColumnDef["width"];
}
export default RendererDateNullable;
