import React, { useCallback, useContext, useId, useMemo } from "react";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorProps,
} from "./BaseSelector";
import {
	Grid,
	InputLabel,
	InputLabelProps,
	List,
	Paper,
	styled,
	Typography,
	useThemeProps,
} from "@mui/material";
import MultiSelectEntry, {
	MultiSelectChangeState,
	MultiSelectEntryProps,
} from "./MultiSelectEntry";
import { showConfirmDialogBool } from "../../non-standalone/Dialog/Utils";
import { DialogContext } from "../../framework/DialogContextProvider";
import useCCTranslations from "../../utils/useCCTranslations";
import combineClassNames from "../../utils/combineClassNames";
import { withMuiFieldState } from "../UIKit/MuiFieldState";
import { DistributiveOmit } from "../../utils/internal/distributiveOmit";

export interface MultiSelectorData extends BaseSelectorData {
	/**
	 * Item click handler
	 */
	onClick?: () => void;
	/**
	 * Can the entry be unselected?
	 * @param data The data entry to be unselected
	 * @param evt The click or key event that asks to remove it: the remove button's click,
	 *            or whatever a selectedEntryRenderer calls handleDelete from, e.g. a Chip's
	 *            Delete key
	 */
	canUnselect?: (
		data: MultiSelectorData,
		evt: React.MouseEvent | React.KeyboardEvent,
	) => boolean | Promise<boolean>;
	/**
	 * Disable delete button
	 */
	noDelete?: boolean;
}

export type MultiSelectProps<DataT extends MultiSelectorData> =
	DistributiveOmit<
		BaseSelectorProps<DataT, false>,
		"multiple" | "onSelect" | "selected" | "classes"
	> & {
		/**
		 * Extended selection change handler
		 * @param data The selected data entry/entries
		 */
		onSelect?: (value: DataT[]) => void;
		/**
		 * The currently selected values
		 */
		selected: DataT[];
		/**
		 * The values of the entries in `selected` that were added but are not saved yet: each is
		 * marked "Added" (MultiSelectEntryProps.changeState)
		 * @default none
		 */
		added?: string[];
		/**
		 * Entries that were removed from the selection but are not saved yet. They are listed
		 * after `selected` (sorted together with them by `selectedSort`), struck through and
		 * marked "Removed", with a restore button where an entry's remove button is: restoring
		 * one calls `onSelect` with the selection and the entry appended. Not part of the
		 * selection otherwise: `onSelect` does not report them, and they are not offered as
		 * options.
		 * @remarks No restore button while disabled or read-only, as no remove button
		 * @default none
		 */
		removed?: DataT[];
		/**
		 * Shows the selection without a way to change it, as the read-only file upload does:
		 * the label, then the selected entries without remove buttons, or "No entries" when
		 * none is selected. There is no search field, so nothing that looks editable: no
		 * placeholder, popup button, end adornments or info button. The entries keep their
		 * onClick, and the list is named by the label. Takes precedence over disabled, which
		 * instead keeps the search field, greyed out and out of the tab order.
		 * @default false
		 */
		readOnly?: boolean;
		/**
		 * Specify a custom component for displaying multi select items. The entries
		 * are the items of one list (`<ul>`), so its root must be an `<li>`, e.g.
		 * MUI's ListItem, as MultiSelectEntry renders. Its `handleDelete` and
		 * `handleRestore` are bound to its entry: call them from any element's click
		 * or key event, e.g. a Chip's `onDelete`.
		 * @remarks With `added` or `removed` it has to show `changeState` and render
		 *          `handleRestore`, as MultiSelectEntry does: a removed entry otherwise looks
		 *          selected and cannot be restored.
		 */
		selectedEntryRenderer?: React.ComponentType<MultiSelectEntryProps<DataT>>;
		/**
		 * CSS class for root
		 */
		className?: string;
		/**
		 * CSS classes to apply
		 */
		classes?: Partial<Record<MultiSelectClassKey, string>>;
		/**
		 * Comparison function (as for Array.sort) for the order in which the
		 * selected entries are listed. It sorts a copy for display only: `selected`
		 * is not changed (it may be frozen), and `onSelect` reports the entries in
		 * `selected`'s order. Without it the entries are listed in `selected`'s
		 * order.
		 * @remarks This is a comparison function
		 * @see Array.sort
		 */
		selectedSort?: (a: DataT, b: DataT) => number;
		/**
		 * Provide generic confirm remove/delete dialog when set to true.
		 * @default false
		 */
		confirmDelete?: boolean;
	};

const Root = styled(Grid, {
	name: "CcMultiSelect",
	slot: "root",
})({});

const SelectedEntry = styled(Grid, {
	name: "CcMultiSelect",
	slot: "selectedEntry",
})(({ theme }) => ({
	border: `1px solid rgba(0, 0, 0, 0.23)`,
	borderTop: 0,
	borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
	// read-only: no search field above, so the box is closed on all sides
	"&.CcMultiSelect-readOnly": {
		borderTop: `1px solid rgba(0, 0, 0, 0.23)`,
		borderRadius: theme.shape.borderRadius,
	},
}));

// a span: it names the list, there is no control to label
const SpanLabel = (props: InputLabelProps) => (
	<InputLabel component={"span"} {...props} />
);

// the read-only selector's label, drawn as BaseSelector draws the label of its field
const ReadOnlyLabel = withMuiFieldState(
	styled(SpanLabel, {
		name: "CcMultiSelect",
		slot: "label",
	})({
		position: "relative",
		transform: "translate(0,0) scale(0.75)",
		zIndex: "unset",
	}),
	"children",
);

// "No entries" of an empty read-only selector, where an entry's text would be
const EmptyText = styled(Typography, {
	name: "CcMultiSelect",
	slot: "empty",
})(({ theme }) => ({
	padding: "12px 8px",
	color: theme.palette.text.secondary,
}));

export interface MultiSelectSelectorOwnerState {
	selected: boolean;
}
const StyledBaseSelector = styled(BaseSelector, {
	name: "CcMultiSelect",
	slot: "selector",
})<{ ownerState: MultiSelectSelectorOwnerState }>(
	({ theme, ownerState: { selected } }) => ({
		"& .MuiAutocomplete-inputRoot": {
			borderRadius: selected
				? `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`
				: undefined,
		},
	}),
) as unknown as typeof BaseSelector; // tradeoff: remove ownerState from type config, but keep generics

export type MultiSelectClassKey =
	"root" | "selectedEntry" | "selector" | "label" | "empty";

const NO_ENTRIES: never[] = [];

/**
 * An entry as MultiSelect lists it: a selected or a removed one
 */
interface ListedEntry<DataT extends MultiSelectorData> {
	data: DataT;
	changeState: MultiSelectChangeState | undefined;
}

const MultiSelect = <DataT extends MultiSelectorData>(
	inProps: MultiSelectProps<DataT>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcMultiSelect" });
	const {
		onLoad,
		onSelect,
		selected,
		added,
		enableIcons,
		selectedEntryRenderer,
		disabled,
		readOnly,
		label,
		error,
		dirty,
		getIdOfData,
		selectedSort,
		confirmDelete,
		className,
		classes,
		filterIds,
		refreshToken,
	} = props;
	const { t } = useCCTranslations();
	const labelId = useId();

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	const removed = props.removed ?? NO_ENTRIES;

	const selectedIds = useMemo(() => selected.map(getId), [getId, selected]);
	const removedIds = useMemo(() => removed.map(getId), [getId, removed]);

	// the selected entries are filtered out of the options on top of whatever the caller
	// wants filtered, and so are the removed ones: they come back through their restore button
	const combinedFilterIds = useMemo(
		() => [...(filterIds ?? []), ...selectedIds, ...removedIds],
		[filterIds, selectedIds, removedIds],
	);

	const listed = useMemo((): ListedEntry<DataT>[] => {
		const entries: ListedEntry<DataT>[] = [
			...selected.map((data) => ({
				data,
				changeState: added?.includes(data.value)
					? ("added" as const)
					: undefined,
			})),
			...removed.map((data) => ({ data, changeState: "removed" as const })),
		];
		return selectedSort
			? entries.sort((a, b) => selectedSort(a.data, b.data))
			: entries;
	}, [added, removed, selected, selectedSort]);

	const EntryRender: React.ComponentType<MultiSelectEntryProps<DataT>> =
		selectedEntryRenderer || MultiSelectEntry;

	const multiSelectHandler = useCallback(
		(data: DataT | null) => {
			if (!data) return;
			const selectedOptions: DataT[] = [...selected, data];
			if (onSelect) onSelect(selectedOptions);
		},
		[onSelect, selected],
	);

	const multiSelectLoadHandler = useCallback(
		async (query: string, switchValue: boolean) => {
			const result = await onLoad(query, switchValue);
			return {
				...result,
				options: result.options.map((entry) =>
					selectedIds.includes(getId(entry))
						? { ...entry, isDisabled: true, selected: true }
						: entry,
				),
			};
		},
		[getId, onLoad, selectedIds],
	);

	const dialogContext = useContext(DialogContext); // this is standalone, so this has to be optional. framework might not be present.
	if (confirmDelete && !dialogContext) {
		throw new Error(
			"[Components-Care] You enabled MultiSelect.confirmDelete, but no DialogContext can be found.",
		);
	}
	const genericDeleteConfirm = useCallback(
		async (evt: React.MouseEvent | React.KeyboardEvent): Promise<boolean> => {
			if (evt.shiftKey) return true;
			if (!dialogContext) return true;
			const [pushDialog] = dialogContext;
			return showConfirmDialogBool(pushDialog, {
				title: t("standalone.selector.multi-select.delete-confirm.title"),
				message: t("standalone.selector.multi-select.delete-confirm.message"),
				textButtonYes: t("standalone.selector.multi-select.delete-confirm.yes"),
				textButtonNo: t("standalone.selector.multi-select.delete-confirm.no"),
			});
		},
		[dialogContext, t],
	);

	const handleDelete = useCallback(
		(entry: DataT, evt: React.MouseEvent | React.KeyboardEvent) => {
			evt.stopPropagation(); // don't trigger onClick event on item itself

			let canDelete = true;
			void (async () => {
				if (entry.canUnselect) {
					canDelete = await entry.canUnselect(entry, evt);
				} else if (confirmDelete) {
					canDelete = await genericDeleteConfirm(evt);
				}
				if (canDelete && onSelect) {
					const selectedOptions = selected.filter(
						(s) => s.value !== entry.value,
					);
					onSelect(selectedOptions);
				}
			})();
		},
		[onSelect, selected, genericDeleteConfirm, confirmDelete],
	);

	const handleRestore = useCallback(
		(entry: DataT, evt: React.MouseEvent | React.KeyboardEvent) => {
			evt.stopPropagation(); // don't trigger onClick event on item itself
			if (!onSelect) return;
			onSelect([...selected, entry]);
		},
		[onSelect, selected],
	);

	// each listed entry's handlers, bound to it, so that an entry can call them from any
	// element (a Chip's onDelete, a menu item), not only from a button that names it
	const entryHandlers = useMemo(
		() =>
			listed.map(({ data }) => ({
				remove: (evt: React.MouseEvent | React.KeyboardEvent) => {
					handleDelete(data, evt);
				},
				restore: (evt: React.MouseEvent | React.KeyboardEvent) => {
					handleRestore(data, evt);
				},
			})),
		[handleDelete, handleRestore, listed],
	);

	const handleSetData = useCallback(
		(newValue: DataT) => {
			if (!onSelect) return;
			onSelect(
				selected.map((entry) =>
					getId(entry) === getId(newValue) ? newValue : entry,
				),
			);
		},
		[getId, onSelect, selected],
	);

	const locked = disabled || readOnly;
	const entries = listed.length > 0 && (
		<List
			disablePadding
			aria-labelledby={readOnly && label ? labelId : undefined}
		>
			{listed.map(({ data, changeState }, index: number) => (
				<EntryRender
					key={getId(data) || index.toString(16)}
					enableDivider={listed.length === index - 1}
					enableIcons={enableIcons}
					handleDelete={
						locked || data.noDelete || changeState === "removed"
							? undefined
							: entryHandlers[index].remove
					}
					changeState={changeState}
					handleRestore={
						locked || changeState !== "removed"
							? undefined
							: entryHandlers[index].restore
					}
					data={data}
					setData={handleSetData}
					iconSize={props.iconSize}
				/>
			))}
		</List>
	);

	if (readOnly) {
		return (
			<Root
				size={"grow"}
				container
				className={combineClassNames([className, classes?.root])}
			>
				{label && (
					<Grid size={12}>
						<ReadOnlyLabel
							id={labelId}
							shrink
							disableAnimation
							error={!!error}
							dirty={dirty}
							className={classes?.label}
						>
							{label}
						</ReadOnlyLabel>
					</Grid>
				)}
				<SelectedEntry
					size={12}
					className={combineClassNames([
						classes?.selectedEntry,
						"CcMultiSelect-readOnly",
					])}
				>
					<Paper elevation={0}>
						{entries || (
							<EmptyText className={classes?.empty}>
								{t("standalone.selector.multi-select.no-entries")}
							</EmptyText>
						)}
					</Paper>
				</SelectedEntry>
			</Root>
		);
	}

	return (
		<Root
			size={"grow"}
			container
			className={combineClassNames([className, classes?.root])}
		>
			<Grid size={12}>
				<StyledBaseSelector
					{...props}
					// @ts-expect-error removed owner state from props to preserve generics
					ownerState={{ selected: listed.length > 0 }}
					className={classes?.selector}
					onLoad={multiSelectLoadHandler}
					selected={null}
					onSelect={multiSelectHandler}
					// not by the removed entries: the token remounts the search field, and a save
					// that sends a removal must leave the focus and the typed text in it
					refreshToken={(refreshToken ?? "") + selectedIds.join(",")}
					filterIds={combinedFilterIds}
				/>
			</Grid>
			{entries && (
				<SelectedEntry size={12} className={classes?.selectedEntry}>
					<Paper elevation={0}>{entries}</Paper>
				</SelectedEntry>
			)}
		</Root>
	);
};

export default React.memo(MultiSelect) as typeof MultiSelect;
