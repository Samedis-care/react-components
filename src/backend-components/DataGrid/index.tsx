import React, { useCallback, useState } from "react";
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
import { useDialogContext } from "../../framework";
import { ErrorDialog } from "../../non-standalone/Dialog";
import ccI18n from "../../i18n";

export interface BackendDataGridProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT
> extends Omit<IDataGridProps, "loadData" | "columns" | "exporters"> {
	model: Model<KeyT, VisibilityT, CustomDataT>;
	enableDelete?: boolean;
}

const BackendDataGrid = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT
>(
	props: BackendDataGridProps<KeyT, VisibilityT, CustomDataT>
) => {
	const { model, enableDelete, enableDeleteAll } = props;

	const [pushDialog] = useDialogContext();
	const [refreshToken, setRefreshToken] = useState("");

	if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
		throw new Error(
			"Delete All functionality requested, but not provided by model backend connector"
		);
	}

	const loadData = useCallback(
		async (params: IDataGridLoadDataParameters): Promise<DataGridData> => {
			const [result, meta] = await model.index(params);
			return {
				rowsTotal: meta.totalRows,
				rows: result.map((entry: Record<KeyT, unknown>) =>
					Object.fromEntries(
						Object.entries(entry).map((kvs) => {
							const [key, value] = kvs;

							// we cannot render the ID, this will cause issues with the selection
							if (key === "id") {
								return [key, value];
							}

							const field = model.fields[key as KeyT];
							const id = "id" in entry && (entry["id"] as string);

							return [
								key,
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call
								field?.type?.render({
									field: key,
									value: value,
									label: field.getLabel(),
									visibility: Object.assign({}, field.visibility.overview, {
										hidden: false,
									}),
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

	const [deleteAdvanced] = model.deleteAdvanced();
	const [deleteMultiple] = model.deleteMultiple();
	const handleDelete = useCallback(
		async (invert: boolean, ids: string[]) => {
			try {
				if (enableDeleteAll) {
					await deleteAdvanced([invert, ids]);
				} else {
					await deleteMultiple(ids);
				}
				setRefreshToken(new Date().getTime().toString());
			} catch (e) {
				pushDialog(
					<ErrorDialog
						title={ccI18n.t(
							"backend-components.data-grid.delete.error-dialog.title"
						)}
						message={ccI18n.t(
							"backend-components.data-grid.delete.error-dialog.message",
							{ ERROR: (e as Error).message }
						)}
						buttons={[
							{
								text: ccI18n.t(
									"backend-components.data-grid.delete.error-dialog.buttons.okay"
								),
							},
						]}
					/>
				);
			}
		},
		[enableDeleteAll, deleteAdvanced, deleteMultiple, pushDialog]
	);

	const columns: IDataGridColumnDef[] = Object.entries(model.fields)
		.filter(
			(entry) =>
				!(entry[1] as ModelFieldDefinition<
					unknown,
					KeyT,
					VisibilityT,
					CustomDataT
				>).visibility.overview.disabled
		)
		.map((entry) => {
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
				hidden: value.visibility.overview.hidden,
				filterable: value.filterable,
				sortable: value.sortable,
			};
		});

	return (
		<DataGrid
			{...props}
			onDelete={enableDelete ? handleDelete : undefined}
			loadData={loadData}
			columns={columns}
			forceRefreshToken={`${
				props.forceRefreshToken || "undefined"
			}${refreshToken}`}
			exporters={model.connector.dataGridExporters}
		/>
	);
};

export default React.memo(BackendDataGrid);
