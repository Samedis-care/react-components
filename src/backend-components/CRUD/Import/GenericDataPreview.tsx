import React, { useMemo } from "react";
import {
	DataGridData,
	DataGridProps,
	DataGridRowData,
	IDataGridColumnDef,
} from "../../../standalone/DataGrid/DataGrid";
import { filterSortPaginate, uniqueArray } from "../../../utils";
import { DataGrid, DataGridNoPersist } from "../../../standalone";

export type GenericDataType = string | number | Date | null;

export interface GenericDataPreviewProps {
	/**
	 * The generic data, should be a Record<string, GenericDataType>
	 */
	data: Record<string, unknown>[];
	/**
	 * Existing (partial) column definition
	 */
	existingDefinition?: IDataGridColumnDef[];
	/**
	 * Default filter settings
	 */
	defaultFilter?: DataGridProps["defaultFilter"];
}

const GenericDataPreview = (props: GenericDataPreviewProps) => {
	const { data, existingDefinition, defaultFilter } = props;

	const columns: string[] = useMemo(
		() => uniqueArray(data.map(Object.keys).flat()),
		[data]
	);

	const columnDef: IDataGridColumnDef[] = useMemo(
		() =>
			columns.map(
				(column) =>
					existingDefinition?.find((entry) => entry.field === column) ?? {
						field: column,
						headerName: column,
						type: "string",
						hidden: false,
						filterable: true,
						sortable: true,
						isLocked: false,
					}
			),
		[existingDefinition, columns]
	);

	const rowData: DataGridRowData[] = useMemo(
		() =>
			data.map((entry, index) => ({
				id: index.toString(16),
				...entry,
			})),
		[data]
	);

	return (
		<DataGridNoPersist>
			<DataGrid
				columns={columnDef}
				disableSelection
				loadData={(params): DataGridData => {
					const processed = filterSortPaginate(rowData, params, columnDef);
					return {
						rowsTotal: rowData.length,
						rowsFiltered: processed[1],
						rows: processed[0],
					};
				}}
				defaultFilter={defaultFilter}
			/>
		</DataGridNoPersist>
	);
};

export default React.memo(GenericDataPreview);
