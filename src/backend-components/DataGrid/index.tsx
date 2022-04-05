import React, { useCallback, useMemo, useState } from "react";
import DataGrid, {
	DataGridData,
	IDataGridLoadDataParameters,
	DataGridProps,
	IDataGridAddButton,
} from "../../standalone/DataGrid/DataGrid";
import Model, {
	ModelFieldName,
	PageVisibility,
	useModelDeleteAdvanced,
	useModelDeleteMultiple,
} from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils";

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
	/**
	 * Additional buttons next to new button
	 */
	additionalNewButtons?: IDataGridAddButton[];
}

export const renderDataGridRecordUsingModel = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomT
>(
	model: Model<KeyT, VisibilityT, CustomT>,
	refreshGrid: () => void
) => (
	entry: Record<string, unknown>
): { id: string } & Record<string, string | null> =>
	Object.fromEntries(
		Object.keys(model.fields)
			.map((key) => {
				// we cannot render the ID, this will cause issues with the selection
				const value = getValueByDot(key, entry);
				if (key === "id") {
					return [
						[key, value],
						[key + "_raw", value],
					];
				}

				const field = model.fields[key as KeyT];
				const { id } = entry as Record<"id", string>;

				// no need to render disabled fields
				if (field.visibility.overview.disabled) {
					return [
						[key, value],
						[key + "_raw", value],
					];
				}

				return [
					[
						key,
						// eslint-disable-next-line @typescript-eslint/no-unsafe-call
						field
							? field.type.render({
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
													...dotToObject(field, value),
												} as Record<string, unknown>,
												"serialize",
												"overview"
											)
										);
										refreshGrid();
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
							  })
							: null,
					],
					[key + "_raw", value],
				];
			})
			.flat()
	) as { id: string } & Record<string, string | null>;

const BackendDataGrid = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT
>(
	props: BackendDataGridProps<KeyT, VisibilityT, CustomDataT>
) => {
	const { model, enableDelete, enableDeleteAll } = props;
	const { t } = useCCTranslations();

	const [pushDialog] = useDialogContext();
	const [refreshToken, setRefreshToken] = useState("");

	if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
		throw new Error(
			"Delete All functionality requested, but not provided by model backend connector"
		);
	}

	const refreshGrid = useCallback(
		() => setRefreshToken(new Date().getTime().toString()),
		[]
	);

	const loadData = useCallback(
		async (params: IDataGridLoadDataParameters): Promise<DataGridData> => {
			const [result, meta] = await model.index(params);
			// eslint-disable-next-line no-debugger
			return {
				rowsTotal: meta.totalRows,
				rowsFiltered: meta.filteredRows,
				rows: result.map(renderDataGridRecordUsingModel(model, refreshGrid)),
			};
		},
		[model, refreshGrid]
	);

	const { mutateAsync: deleteAdvanced } = useModelDeleteAdvanced(model);
	const { mutateAsync: deleteMultiple } = useModelDeleteMultiple(model);
	const handleDelete = useCallback(
		async (
			invert: boolean,
			ids: string[],
			filter?: Pick<
				IDataGridLoadDataParameters,
				"quickFilter" | "additionalFilters" | "fieldFilter"
			>
		): Promise<void> => {
			await showConfirmDialog(pushDialog, {
				title: t("backend-components.data-grid.delete.confirm-dialog.title"),
				message: t(
					"backend-components.data-grid.delete.confirm-dialog." +
						(invert ? "messageInverted" : "message"),
					{ NUM: ids.length }
				),
				textButtonYes: t(
					"backend-components.data-grid.delete.confirm-dialog.buttons.yes"
				),
				textButtonNo: t(
					"backend-components.data-grid.delete.confirm-dialog.buttons.no"
				),
			});

			try {
				if (enableDeleteAll) {
					await deleteAdvanced([invert, ids, filter]);
				} else {
					await deleteMultiple(ids);
				}
				refreshGrid();
			} catch (e) {
				refreshGrid();
				pushDialog(
					<ErrorDialog
						title={t("backend-components.data-grid.delete.error-dialog.title")}
						message={t(
							"backend-components.data-grid.delete.error-dialog.message",
							{ ERROR: (e as Error).message }
						)}
						buttons={[
							{
								text: t(
									"backend-components.data-grid.delete.error-dialog.buttons.okay"
								),
							},
						]}
					/>
				);
			}
		},
		[
			pushDialog,
			t,
			enableDeleteAll,
			deleteAdvanced,
			deleteMultiple,
			refreshGrid,
		]
	);

	const addNewButtons: DataGridProps["onAddNew"] = useMemo(() => {
		if (!props.additionalNewButtons) return props.onAddNew;
		if (!props.onAddNew) return props.additionalNewButtons;

		let result: IDataGridAddButton[];
		if (typeof props.onAddNew === "function") {
			result = [
				{
					label: t("standalone.data-grid.header.new") ?? "",
					onClick: props.onAddNew,
				},
			];
		} else if (props.onAddNew) {
			result = props.onAddNew;
		} else {
			result = [];
		}
		result = result.concat(props.additionalNewButtons);
		return result;
	}, [props.additionalNewButtons, props.onAddNew, t]);

	return (
		<DataGrid
			{...props}
			onAddNew={addNewButtons}
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
