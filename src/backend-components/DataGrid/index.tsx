import React, { useCallback, useState } from "react";
import DataGrid, {
	DataGridData,
	IDataGridLoadDataParameters,
	DataGridProps,
} from "../../standalone/DataGrid/DataGrid";
import Model, {
	ModelFieldName,
	PageVisibility,
} from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone";
import ccI18n from "../../i18n";

export interface BackendDataGridProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT
> extends Omit<DataGridProps, "loadData" | "columns" | "exporters"> {
	/**
	 * The model to use
	 */
	model: Model<KeyT, VisibilityT, CustomDataT>;
	/**
	 * Enable deletion?
	 */
	enableDelete?: boolean;
	/**
	 * Disable export?
	 */
	disableExport?: boolean;
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
			// eslint-disable-next-line no-debugger
			return {
				rowsTotal: meta.totalRows,
				rowsFiltered: meta.filteredRows,
				rows: result.map((entry: Record<KeyT, unknown>) =>
					Object.fromEntries(
						Object.entries(entry).map((kvs) => {
							const [key, value] = kvs;

							// we cannot render the ID, this will cause issues with the selection
							if (key === "id") {
								return kvs;
							}

							const field = model.fields[key as KeyT];
							const id = "id" in entry && (entry["id"] as string);

							return [
								key,
								// eslint-disable-next-line @typescript-eslint/no-unsafe-call
								field?.type?.render({
									field: key,
									value: value,
									touched: false,
									initialValue: value,
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

										await model.connector.update(
											await model.applySerialization(
												{
													id,
													[field]: value,
												} as Record<KeyT, unknown>,
												"serialize",
												"overview"
											)
										);
										setRefreshToken(new Date().getTime().toString());
									},
									handleBlur: () => {
										// this is unhandled in the data grid
									},
									errorMsg: null,
									setError: () => {
										throw new Error("Not implemented in Grid");
									},
									setFieldTouched: () => {
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

	const { mutateAsync: deleteAdvanced } = model.deleteAdvanced();
	const { mutateAsync: deleteMultiple } = model.deleteMultiple();
	const handleDelete = useCallback(
		async (
			invert: boolean,
			ids: string[],
			filter?: Pick<
				IDataGridLoadDataParameters,
				"quickFilter" | "additionalFilters" | "fieldFilter"
			>
		) => {
			try {
				await showConfirmDialog(pushDialog, {
					title: ccI18n.t(
						"backend-components.data-grid.delete.confirm-dialog.title"
					),
					message: ccI18n.t(
						"backend-components.data-grid.delete.confirm-dialog." +
							(invert ? "messageInverted" : "message"),
						{ NUM: ids.length }
					),
					textButtonYes: ccI18n.t(
						"backend-components.data-grid.delete.confirm-dialog.buttons.yes"
					),
					textButtonNo: ccI18n.t(
						"backend-components.data-grid.delete.confirm-dialog.buttons.no"
					),
				});
			} catch (e) {
				// user said no
				return;
			}

			try {
				if (enableDeleteAll) {
					await deleteAdvanced([invert, ids, filter]);
				} else {
					await deleteMultiple(ids);
				}
				setRefreshToken(new Date().getTime().toString());
			} catch (e) {
				setRefreshToken(new Date().getTime().toString());
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

	return (
		<DataGrid
			{...props}
			onDelete={enableDelete ? handleDelete : undefined}
			loadData={loadData}
			columns={model.toDataGridColumnDefinition()}
			forceRefreshToken={`${
				props.forceRefreshToken || "undefined"
			}${refreshToken}`}
			exporters={
				props.disableExport ? undefined : model.connector.dataGridExporters
			}
		/>
	);
};

export default React.memo(BackendDataGrid) as typeof BackendDataGrid;
