import React, { useCallback, useMemo, useState } from "react";
import DataGrid, {
	DataGridData,
	DataGridDispatch,
	DataGridFilterParameters,
	IDataGridLoadDataParameters,
	DataGridProps,
	DataGridRowData,
	IDataGridAddButton,
} from "../../standalone/DataGrid/DataGrid";
import {
	ModelFieldName,
	ModelRecord,
	ModelUnknown,
	useModelDeleteAdvanced,
	useModelDeleteMultiple,
} from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isPlainObject from "../../utils/isPlainObject";

export interface BackendDataGridProps<M extends ModelUnknown> extends Omit<
	DataGridProps,
	"loadData" | "columns" | "exporters" | "onDelete" | "getRowLabel"
> {
	/**
	 * The model to use
	 */
	model: M;
	/**
	 * The text that identifies a row to assistive technology, e.g. a person's
	 * name: the row's checkbox is named after it ("Select Carol Jones"), and a
	 * customSelectionControl gets it as rowLabel.
	 * Defaults to DataGridProps.getRowLabel's default: the text the first
	 * visible text column shows.
	 * @param record The row's record, as the model's index returned it
	 * @return The label; an empty string names the checkbox "Select row"
	 */
	getRowLabel?: (record: ModelRecord<M>) => string;
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
		filter?: DataGridFilterParameters,
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
	/**
	 * Called once a delete has run, whether it succeeded or failed, e.g. to
	 * refresh data outside the grid that the delete changed
	 * @param inverted IDs inverted? (all except ids)
	 * @param ids The IDs deleted (or not deleted)
	 * @param filter Complex filter (see DataGridProps.onDelete)
	 * @param error Why the delete failed, undefined if it succeeded
	 * @remarks A failed delete may still have deleted some records. Called after
	 *          the grid refreshes and before the error is shown, not when the
	 *          user cancels the confirmation.
	 */
	onDeleteSettled?: (
		inverted: boolean,
		ids: string[],
		filter: DataGridFilterParameters | undefined,
		error: Error | undefined,
	) => void;
}

export const useBackendDataGridAddNewButtons = (
	props: Pick<
		BackendDataGridProps<ModelUnknown>,
		"onAddNew" | "additionalNewButtons"
	>,
) => {
	const { t } = useCCTranslations();
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
	return addNewButtons;
};

/**
 * The delete handler BackendDataGrid passes to DataGrid as onDelete: it asks for
 * confirmation (customDeleteConfirm or the built-in dialog), deletes through the
 * model, calls refreshGrid and onDeleteSettled, and reports a failure
 * (customDeleteErrorHandler or the built-in error dialog).
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 * @returns The handler, or undefined without enableDelete. The handler resolves false
 *          when the user cancels the confirmation: nothing was deleted, so the grid
 *          keeps the selection. It resolves true once the delete ran, also when it
 *          failed (a failed delete may have deleted some of the records).
 */
export const useBackendDataGridDeleteHandler = <M extends ModelUnknown>(
	props: Pick<
		BackendDataGridProps<M>,
		| "model"
		| "enableDelete"
		| "enableDeleteAll"
		| "customDeleteConfirm"
		| "customDeleteErrorHandler"
		| "onDeleteSettled"
	>,
	refreshGrid: () => void,
) => {
	const {
		model,
		enableDelete,
		enableDeleteAll,
		customDeleteConfirm,
		customDeleteErrorHandler,
		onDeleteSettled,
	} = props;
	const { t } = useCCTranslations();

	const [pushDialog] = useDialogContext();
	if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
		throw new Error(
			"Delete All functionality requested, but not provided by model backend connector",
		);
	}

	const { mutateAsync: deleteAdvanced } = useModelDeleteAdvanced(model);
	const { mutateAsync: deleteMultiple } = useModelDeleteMultiple(model);
	const handleDelete = useCallback(
		async (
			invert: boolean,
			ids: string[],
			filter?: DataGridFilterParameters,
		): Promise<boolean> => {
			try {
				if (customDeleteConfirm) {
					await customDeleteConfirm(invert, ids, filter);
				} else {
					await showConfirmDialog(pushDialog, {
						title: t(
							"backend-components.data-grid.delete.confirm-dialog.title",
						),
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
			} catch (e) {
				// user cancelled
				// eslint-disable-next-line no-console
				console.error(e);
				return false;
			}

			let error: Error | undefined;
			try {
				if (enableDeleteAll) {
					await deleteAdvanced([invert, ids, filter]);
				} else {
					await deleteMultiple(ids);
				}
			} catch (e) {
				error = e as Error;
			}
			refreshGrid();
			onDeleteSettled?.(invert, ids, filter, error);
			if (!error) return true;

			if (customDeleteErrorHandler) {
				await customDeleteErrorHandler(error);
			} else {
				pushDialog(
					<ErrorDialog
						title={t("backend-components.data-grid.delete.error-dialog.title")}
						message={t(
							"backend-components.data-grid.delete.error-dialog.message",
							{ ERROR: error.message },
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
			return true;
		},
		[
			customDeleteConfirm,
			customDeleteErrorHandler,
			onDeleteSettled,
			pushDialog,
			t,
			enableDeleteAll,
			refreshGrid,
			deleteAdvanced,
			deleteMultiple,
		],
	);
	return enableDelete ? handleDelete : undefined;
};

export const renderDataGridRecordUsingModel =
	(model: ModelUnknown, refreshGrid: () => void) =>
	(
		entry: ModelRecord<ModelUnknown>,
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

					const field = model.fields[key];
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

							field
								? field.type.render({
										field: key,
										value: value,
										touched: false,
										// grid cells render server data, there is nothing to diff against
										dirty: false,
										autoFocus: false,
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
														},
														"serialize",
														"overview",
													),
												);
												refreshGrid();
											})();
										},
										setFieldValue: () => {
											throw new Error("Not implemented in Grid");
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

/**
 * The record a row of renderDataGridRecordUsingModel was rendered from: the
 * values of the model's fields before rendering, put together as the model's
 * deserialization does
 * @param model The model the row was rendered with
 * @param row The row
 */
const dataGridRowToModelRecord = <M extends ModelUnknown>(
	model: M,
	row: DataGridRowData,
): ModelRecord<M> => {
	const record: Record<string, unknown> = {};
	for (const key of Object.keys(model.fields)) {
		const value: unknown = row[key + "_raw"];
		deepAssign(
			record,
			dotToObject(key, isPlainObject(value) ? deepClone(value) : value),
		);
	}
	return record as ModelRecord<M>;
};

/**
 * DataGridProps.getRowLabel for a grid whose rows renderDataGridRecordUsingModel
 * rendered, from a getRowLabel that takes the model's record
 * (BackendDataGridProps.getRowLabel)
 * @param model The model the rows are rendered with
 * @param getRowLabel The row label from the model's record, or undefined for
 *                    the grid's default
 * @returns The grid's getRowLabel, undefined without getRowLabel
 */
export const useBackendDataGridRowLabel = <M extends ModelUnknown>(
	model: M,
	getRowLabel: ((record: ModelRecord<M>) => string) | undefined,
): DataGridProps["getRowLabel"] =>
	useMemo(
		() =>
			getRowLabel &&
			((row: DataGridRowData) =>
				getRowLabel(dataGridRowToModelRecord(model, row))),
		[model, getRowLabel],
	);

const BackendDataGrid = <M extends ModelUnknown>(
	props: BackendDataGridProps<M>,
	ref: React.Ref<DataGridDispatch>,
) => {
	const { model } = props;
	const [refreshToken, setRefreshToken] = useState("");

	const refreshGrid = useCallback(
		() => setRefreshToken(new Date().getTime().toString()),
		[],
	);

	const loadData = useCallback(
		async (params: IDataGridLoadDataParameters): Promise<DataGridData> => {
			const [result, meta] = await model.index(params);

			return {
				rowsTotal: meta.totalRows,
				rowsFiltered: meta.filteredRows,
				rows: result.map(renderDataGridRecordUsingModel(model, refreshGrid)),
			};
		},
		[model, refreshGrid],
	);

	const addNewButtons = useBackendDataGridAddNewButtons(props);
	const handleDelete = useBackendDataGridDeleteHandler(props, refreshGrid);
	const getRowLabel = useBackendDataGridRowLabel(model, props.getRowLabel);

	return (
		<DataGrid
			{...props}
			ref={ref}
			getRowLabel={getRowLabel}
			onAddNew={addNewButtons}
			onDelete={handleDelete}
			loadData={loadData}
			columns={useMemo(() => model.toDataGridColumnDefinition(), [model])}
			forceRefreshToken={`${
				props.forceRefreshToken || "undefined"
			}${refreshToken}`}
			exporters={
				props.disableExport ? undefined : model.connector.dataGridExporters
			}
		/>
	);
};

export type BackendDataGridType = <M extends ModelUnknown>(
	props: BackendDataGridProps<M> & React.RefAttributes<DataGridDispatch>,
) => React.ReactElement | null;

export default React.memo(
	React.forwardRef(BackendDataGrid),
) as BackendDataGridType;
