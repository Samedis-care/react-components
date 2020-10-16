import React, { useCallback } from "react";
import DataGrid, {
	DataGridData,
	IDataGridColumnDef,
	IDataGridLoadDataParameters,
	IDataGridProps,
} from "../../standalone/DataGrid";
import Model, {
	ModelFieldDefinition,
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";

export interface BackendDataGridProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT
> extends Omit<IDataGridProps, "loadData" | "columnDef"> {
	model: Model<KeyT, VisibilityT, CustomDataT>;
}

const BackendDataGrid = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT
>(
	props: BackendDataGridProps<KeyT, VisibilityT, CustomDataT>
) => {
	const { model } = props;

	const loadData = useCallback(
		async (params: IDataGridLoadDataParameters): Promise<DataGridData> => {
			const meta = {
				totalRows: 0,
			};
			const result = await model.connector.index(meta, params);
			return {
				rowsTotal: meta.totalRows,
				rows: result.map((entry) =>
					Object.fromEntries(
						Object.entries(entry).map((kvs) => {
							const [key, value] = kvs;
							const field = model.fields[key as KeyT];
							const id = "id" in entry && (entry["id"] as string);

							return [
								key,
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call
								field?.type?.render({
									field: key,
									value: value,
									label: field.getLabel(),
									visibility: field.visibility.overview,
									/**
									 * The onChange handler for editable input fields
									 */
									handleChange: async (
										field: ModelFieldName,
										value: unknown
									) => {
										if (!id) throw new Error("ID not set!");

										await model.connector.update({
											id: id,
											[field]: value,
										});
									},
									handleBlur: () => {
										// this is unhandled in the data grid
									},
									errorMsg: null,
									setError: () => {
										throw new Error("Not implemented in Grid");
									},
								}) || null,
							];
						})
					)
				) as ({ id: string } & Record<string, string | null>)[],
			};
		},
		[model]
	);

	const columns: IDataGridColumnDef[] = Object.entries(model.fields).map(
		(entry) => {
			const key = entry[0];
			const value = entry[1] as ModelFieldDefinition<
				unknown,
				KeyT,
				VisibilityT,
				CustomDataT
			>;
			return {
				field: key,
				headerName: value.getLabel(),
				type: value.type.getFilterType(),
			};
		}
	);

	return <DataGrid {...props} loadData={loadData} columns={columns} />;
};

export default React.memo(BackendDataGrid);
