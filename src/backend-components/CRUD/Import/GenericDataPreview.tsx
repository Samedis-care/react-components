import React, { useMemo, useState } from "react";
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
	ModelUnknown,
	ModelVisibilityGridView,
} from "../../../backend-integration";

export type GenericDataType = string | number | Date | null;

export interface GenericDataPreviewProps {
	/**
	 * The model to render data with
	 * @remarks Another model reloads the rows, as another data array does
	 */
	model?: ModelUnknown;
	/**
	 * The generic data, should be a Record<string, GenericDataType>
	 * @remarks Another array reloads the rows (the search, filters and sort stay), so pass
	 *          the same array while the rows stay the same (e.g. with useMemo)
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

	// loadData reads the rows of the latest render, but the grid asks it again only when
	// its query or forceRefreshToken changes: count the data and models the preview got
	const [source, setSource] = useState({ data, model, version: 0 });
	if (source.data !== data || source.model !== model) {
		setSource({ data, model, version: source.version + 1 });
	}

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
															dirty: false,
															autoFocus: false,
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
				forceRefreshToken={source.version.toString()}
			/>
		</DataGridNoPersist>
	);
};

export default React.memo(GenericDataPreview);
