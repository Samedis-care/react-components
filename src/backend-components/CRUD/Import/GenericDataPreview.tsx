import React, { useMemo } from "react";
import {
	DataGridData,
	DataGridProps,
	DataGridRowData,
	IDataGridColumnDef,
} from "../../../standalone/DataGrid/DataGrid";
import filterSortPaginate from "../../../utils/filterSortPaginate";
import uniqueArray from "../../../utils/uniqueArray";
import { DataGrid, DataGridNoPersist } from "../../../standalone";
import throwError from "../../../utils/throwError";
import {
	Model,
	ModelFieldName,
	ModelVisibilityGridView,
	PageVisibility,
} from "../../../backend-integration";

export type GenericDataType = string | number | Date | null;

export interface GenericDataPreviewProps {
	/**
	 * The model to render data with
	 */
	model?: Model<ModelFieldName, PageVisibility, unknown>;
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
	const { model, data, existingDefinition, defaultFilter } = props;

	const columns: string[] = useMemo(
		() => uniqueArray(data.map(Object.keys).flat()),
		[data],
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
					},
			),
		[existingDefinition, columns],
	);

	const rowData: DataGridRowData[] = useMemo(
		() =>
			data.map((entry, index) => ({
				id: index.toString(16),
				...entry,
			})),
		[data],
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
						rows: model
							? processed[0].map(
									(entry) =>
										Object.fromEntries(
											Object.entries(entry).map(([key, value]) => [
												key,
												key in model.fields
													? model.fields[key].type.render({
															label: model.fields[key].getLabel(),
															field: key,
															initialValue: value as unknown,
															value: value as unknown,
															visibility: ModelVisibilityGridView,
															values: entry,
															errorMsg: null,
															warningMsg: null,
															touched: false,
															setError: () => throwError("not supported"),
															setFieldValue: () => throwError("not supported"),
															handleBlur: () => throwError("not supported"),
															handleChange: () => throwError("not supported"),
															setFieldTouched: () =>
																throwError("not supported"),
														})
													: value,
											]),
										) as DataGridData["rows"][number],
								)
							: processed[0],
					};
				}}
				defaultFilter={defaultFilter}
			/>
		</DataGridNoPersist>
	);
};

export default React.memo(GenericDataPreview);
