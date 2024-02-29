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
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";

export interface BackendDataGridProps<
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT,
> extends Omit<
		DataGridProps,
		"loadData" | "columns" | "exporters" | "onDelete"
	> {
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
	 * Callback for custom confirmation dialog
	 * @param inverted IDs inverted? (all except ids)
	 * @param ids The IDs to delete (or not to delete)
	 * @param filter Complex filter (see DataGridProps.onDelete)
	 * @throws Error to cancel delete
	 */
	customDeleteConfirm?: (
		inverted: boolean,
		ids: string[],
		filter?: Pick<
			IDataGridLoadDataParameters,
			"quickFilter" | "additionalFilters" | "fieldFilter"
		>,
	) => Promise<void> | void;
	/**
	 * Additional buttons next to new button
	 */
	additionalNewButtons?: IDataGridAddButton[];
	/**
	 * Custom delete error handler
	 * @param error The error
	 * @remarks Usually shows an error dialog for the user
	 */
	customDeleteErrorHandler?: (error: Error) => Promise<void> | void;
}

export const renderDataGridRecordUsingModel =
	<KeyT extends ModelFieldName, VisibilityT extends PageVisibility, CustomT>(
		model: Model<KeyT, VisibilityT, CustomT>,
		refreshGrid: () => void,
	) =>
	(
		entry: Record<string, unknown>,
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
										handleChange: (field: ModelFieldName, value: unknown) => {
											if (!id) throw new Error("ID not set!");

											void (async () => {
												await model.connector.update(
													await model.applySerialization(
														{
															id,
															...dotToObject(field, value),
														} as Record<string, unknown>,
														"serialize",
														"overview",
													),
												);
												refreshGrid();
											})();
										},
										handleBlur: () => {
											// this is unhandled in the data grid
										},
										errorMsg: null,
										warningMsg: null,
										setError: () => {
											throw new Error("Not implemented in Grid");
										},
										setFieldTouched: () => {
											throw new Error("Not implemented in Grid");
										},
										values: entry,
									})
								: null,
						],
						[key + "_raw", value],
					];
				})
				.flat(),
		) as { id: string } & Record<string, string | null>;

const BackendDataGrid = <
	KeyT extends ModelFieldName,
	VisibilityT extends PageVisibility,
	CustomDataT,
>(
	props: BackendDataGridProps<KeyT, VisibilityT, CustomDataT>,
) => {
	const {
		model,
		enableDelete,
		enableDeleteAll,
		customDeleteConfirm,
		customDeleteErrorHandler,
	} = props;
	const { t } = useCCTranslations();

	const [pushDialog] = useDialogContext();
	const [refreshToken, setRefreshToken] = useState("");

	if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
		throw new Error(
			"Delete All functionality requested, but not provided by model backend connector",
		);
	}

	const refreshGrid = useCallback(
		() => setRefreshToken(new Date().getTime().toString()),
		[],
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
		[model, refreshGrid],
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
			>,
		): Promise<void> => {
			if (customDeleteConfirm) {
				await customDeleteConfirm(invert, ids, filter);
			} else {
				await showConfirmDialog(pushDialog, {
					title: t("backend-components.data-grid.delete.confirm-dialog.title"),
					message: t(
						"backend-components.data-grid.delete.confirm-dialog." +
							(invert ? "messageInverted" : "message"),
						{ NUM: ids.length },
					),
					textButtonYes: t(
						"backend-components.data-grid.delete.confirm-dialog.buttons.yes",
					),
					textButtonNo: t(
						"backend-components.data-grid.delete.confirm-dialog.buttons.no",
					),
				});
			}

			try {
				if (enableDeleteAll) {
					await deleteAdvanced([invert, ids, filter]);
				} else {
					await deleteMultiple(ids);
				}
				refreshGrid();
			} catch (e) {
				refreshGrid();
				if (customDeleteErrorHandler) {
					await customDeleteErrorHandler(e as Error);
				} else {
					pushDialog(
						<ErrorDialog
							title={t(
								"backend-components.data-grid.delete.error-dialog.title",
							)}
							message={t(
								"backend-components.data-grid.delete.error-dialog.message",
								{ ERROR: (e as Error).message },
							)}
							buttons={[
								{
									text: t(
										"backend-components.data-grid.delete.error-dialog.buttons.okay",
									),
								},
							]}
						/>,
					);
				}
			}
		},
		[
			customDeleteConfirm,
			customDeleteErrorHandler,
			pushDialog,
			t,
			enableDeleteAll,
			refreshGrid,
			deleteAdvanced,
			deleteMultiple,
		],
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
		} else if (typeof props.onAddNew === "string") {
			result = [
				{
					label: t("standalone.data-grid.header.new") ?? "",
					onClick: undefined,
					disableHint: props.onAddNew,
				},
			];
		} else if (Array.isArray(props.onAddNew)) {
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
