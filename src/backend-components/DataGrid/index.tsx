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
	ModelRecord,
	ModelUnknown,
	useModelDeleteAdvanced,
	useModelDeleteMultiple,
} from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { useToastContext } from "../../framework/ToastContextProvider";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isPlainObject from "../../utils/isPlainObject";
import InlineEditCell from "./InlineEditCell";
import ModelCell from "./ModelCell";
import renderModelCell from "./renderModelCell";
import ccI18n from "../../i18n";

export interface BackendDataGridProps<M extends ModelUnknown> extends Omit<
	DataGridProps,
	"loadData" | "columns" | "exporters" | "onDelete" | "deleting" | "getRowLabel"
> {
	/**
	 * The model to use
	 * @remarks The cells follow components-care's language: they render again in the
	 *          current language when it changes. The column headers are read from the
	 *          model's labels (getLabel, getHeaderName, getColumnLabel) once per model
	 *          instance, so a model whose labels change, e.g. with the language, has to
	 *          be a new instance, such as one memoized on useTranslation's t.
	 */
	model: M;
	/**
	 * The text that identifies a row to assistive technology, e.g. a person's
	 * name: the row's checkbox is named after it ("Select Carol Jones"), a
	 * customSelectionControl gets it as rowLabel, and a control edited in a cell
	 * is named after it and its field ("Active, Carol Jones").
	 * Defaults to DataGridProps.getRowLabel's default: the text the first
	 * visible text column shows.
	 * @param record The row's record, as the model's index returned it
	 * @return The label; an empty string names the checkbox "Select row" and
	 *         leaves a control edited in a cell named after its field alone
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
	 * Additional buttons next to new button. On phones (xs) they are entries
	 * of the header's "More options" menu (see DataGridProps.onAddNew).
	 */
	additionalNewButtons?: IDataGridAddButton[];
	/**
	 * Custom delete error handler
	 * @param error The error
	 * @remarks Usually shows an error dialog for the user
	 */
	customDeleteErrorHandler?: (error: Error) => Promise<void> | void;
	/**
	 * Custom delete success handler, called once a delete went through, instead
	 * of the built-in toast ("2 entries deleted", announced politely), e.g. to
	 * word it for what the grid's delete means to the user
	 * @param inverted IDs inverted? (all except ids)
	 * @param ids The IDs deleted (or not deleted)
	 * @param filter Complex filter (see DataGridProps.onDelete)
	 * @remarks Called after the grid refreshes and before onDeleteSettled
	 */
	customDeleteSuccessHandler?: (
		inverted: boolean,
		ids: string[],
		filter: DataGridFilterParameters | undefined,
	) => void;
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
 * The delete props of BackendDataGrid that useBackendDataGridDeleteHandler takes
 */
type BackendDataGridDeleteProps<M extends ModelUnknown> = Pick<
	BackendDataGridProps<M>,
	| "model"
	| "enableDelete"
	| "enableDeleteAll"
	| "customDeleteConfirm"
	| "customDeleteErrorHandler"
	| "customDeleteSuccessHandler"
	| "onDeleteSettled"
>;

/**
 * useBackendDataGridDeleteHandler, together with whether the handler's delete
 * request runs (DataGridProps.deleting)
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 */
const useBackendDataGridDelete = <M extends ModelUnknown>(
	props: BackendDataGridDeleteProps<M>,
	refreshGrid: () => void,
) => {
	const {
		model,
		enableDelete,
		enableDeleteAll,
		customDeleteConfirm,
		customDeleteErrorHandler,
		customDeleteSuccessHandler,
		onDeleteSettled,
	} = props;
	const { t } = useCCTranslations();

	const [pushDialog] = useDialogContext();
	const [showToast] = useToastContext();
	if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
		throw new Error(
			"Delete All functionality requested, but not provided by model backend connector",
		);
	}

	const { mutateAsync: deleteAdvanced, isPending: deletingAdvanced } =
		useModelDeleteAdvanced(model);
	const { mutateAsync: deleteMultiple, isPending: deletingMultiple } =
		useModelDeleteMultiple(model);
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
							{ count: ids.length },
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
			if (!error) {
				// before onDeleteSettled, which may throw
				if (customDeleteSuccessHandler) {
					customDeleteSuccessHandler(invert, ids, filter);
				} else {
					showToast({
						severity: "success",
						message: invert
							? t(
									"backend-components.data-grid.delete.success-toast.messageInverted",
								)
							: t("backend-components.data-grid.delete.success-toast.message", {
									count: ids.length,
								}),
					});
				}
			}
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
			customDeleteSuccessHandler,
			onDeleteSettled,
			pushDialog,
			showToast,
			t,
			enableDeleteAll,
			refreshGrid,
			deleteAdvanced,
			deleteMultiple,
		],
	);
	return {
		handleDelete: enableDelete ? handleDelete : undefined,
		deleting: deletingAdvanced || deletingMultiple,
	};
};

/**
 * The delete handler BackendDataGrid passes to DataGrid as onDelete: it asks for
 * confirmation (customDeleteConfirm or the built-in dialog), deletes through the
 * model, calls refreshGrid, announces the delete (customDeleteSuccessHandler or a
 * toast such as "2 entries deleted"), calls onDeleteSettled, and reports a failure
 * (customDeleteErrorHandler or the built-in error dialog). It needs the Framework
 * (its dialogs and toasts).
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 * @returns The handler, or undefined without enableDelete. The handler resolves false
 *          when the user cancels the confirmation: nothing was deleted, so the grid
 *          keeps the selection. It resolves true once the delete ran, also when it
 *          failed (a failed delete may have deleted some of the records).
 */
export const useBackendDataGridDeleteHandler = <M extends ModelUnknown>(
	props: BackendDataGridDeleteProps<M>,
	refreshGrid: () => void,
) => useBackendDataGridDelete(props, refreshGrid).handleDelete;

/**
 * Turns a record from model.index into a grid row: `row.id` is the record's id,
 * `row[field]` the rendered cell of each model field and `row[field + "_raw"]` its
 * value. A cell renders again in components-care's current language when it changes
 * (ModelCell), since the renderers translate while they render ("Yes", enum labels,
 * formatted dates). A field with an editable overview visibility
 * (ModelVisibilityGridEdit) is edited in its cell, which saves every change at once
 * through the model's mutation (useModelMutation, so the model's cache, hooks and
 * "mutate" listeners hear of it), then calls refreshGrid; a refused save is shown in an
 * error dialog (the cell needs the Framework), and refreshGrid is called as well. The cell's control is named after its
 * field and the row ("Active, example.com"), since a grid cell has no label element to
 * name it (InlineEditCell).
 * @param model The model the record belongs to
 * @param refreshGrid Called after an inline edit was saved or refused, to reload the
 *                    rows
 * @returns A function that builds the row of one record. It throws "Not supported"
 *          for an editable field whose renderer has no grid editor.
 */
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

					// no need to render disabled fields
					if (field.visibility.overview.disabled) {
						return [
							[key, value],
							[key + "_raw", value],
						];
					}

					// rendered while loading, for an editable field too, so that a renderer
					// without a grid editor fails the load ("Not supported") instead of the
					// grid's render
					const cell = renderModelCell(model, key, entry);
					return [
						[
							key,
							field.visibility.overview.editable ? (
								<InlineEditCell
									model={model}
									field={key}
									record={entry}
									refreshGrid={refreshGrid}
								/>
							) : (
								<ModelCell
									model={model}
									field={key}
									record={entry}
									language={ccI18n.language}
								>
									{cell}
								</ModelCell>
							),
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
	const { handleDelete, deleting } = useBackendDataGridDelete(
		props,
		refreshGrid,
	);
	const getRowLabel = useBackendDataGridRowLabel(model, props.getRowLabel);

	return (
		<DataGrid
			{...props}
			ref={ref}
			getRowLabel={getRowLabel}
			onAddNew={addNewButtons}
			onDelete={handleDelete}
			deleting={deleting}
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
