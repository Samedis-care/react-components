import React, { useCallback, useMemo } from "react";
import {
	Cancel as RemoveIcon,
	RestoreFromTrash as RestoreIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import {
	BaseSelectorProps,
	MultiSelectorData,
} from "../../standalone/Selector";
import BaseSelector, { BaseSelectorLoadHandler } from "./BaseSelector";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import InlineSwitch from "../InlineSwitch";
import { Chip, styled, Typography, useThemeProps } from "@mui/material";
import useCCTranslations from "../../utils/useCCTranslations";
import { DistributiveOmit } from "../../utils/distributiveOmit";
import combineClassNames from "../../utils/combineClassNames";
import { MultiSelectChangeState } from "./MultiSelectEntry";

export type MultiSelectWithoutGroupProps<DataT extends MultiSelectorData> =
	DistributiveOmit<
		BaseSelectorProps<DataT, false>,
		"onSelect" | "selected" | "classes" | "onLoad"
	> & {
		// UI Props
		/**
		 * Extended selection change handler
		 * @param data The selected data entry/entries
		 */
		onSelect?: (value: DataT[]) => void;
		/**
		 * Custom styles
		 */
		classes?: Partial<Record<MultiSelectWithoutGroupClassKey, string>>;
		// Data management props
		/**
		 * The currently selected values
		 */
		selected: DataT[];
		/**
		 * The values of the entries in `selected` that were added but are not saved yet: each
		 * of their chips is marked "Added"
		 * @default none
		 */
		added?: string[];
		/**
		 * Entries that were removed from the selection but are not saved yet. Their chips
		 * follow the selected ones (sorted together with them by `sortCompareFn`), the label
		 * struck through and marked "Removed", with a restore button where a chip's remove
		 * button is: restoring one calls `onSelect` with the selection and the entry
		 * appended. Not part of the selection otherwise: `onSelect` does not report them, and
		 * they are not offered as options.
		 * @remarks No restore button while disabled, as no remove button
		 * @default none
		 */
		removed?: DataT[];
		/**
		 * State of the switch control
		 */
		switchValue?: boolean;
		/**
		 * Set value for switch position
		 * @param checked The value of switch input
		 */
		setSwitchValue?: (checked: boolean) => void;
		/**
		 * Search callback which is called to load available data entries
		 */
		loadDataOptions: BaseSelectorLoadHandler<DataT>;
		/**
		 * Optional callback for customizing the unique identifier of data
		 * @param data The data struct
		 * @returns A unique ID extracted from data
		 * @default returns data.value
		 */
		getIdOfData?: (data: DataT) => string;
		/**
		 * Comparison function (as for Array.sort) for the order of the chips. It
		 * sorts a copy for display only: `selected` is not changed (it may be
		 * frozen), and `onSelect` reports the entries in `selected`'s order.
		 * Without it the chips are shown in `selected`'s order.
		 */
		sortCompareFn?: (value1: DataT, value2: DataT) => number;
	};

const Outlined = styled("div", {
	name: "CcMultiSelectWithoutGroup",
	slot: "outlined",
})({
	float: "left",
	backgroundColor: "#cce1f6",
	padding: "0px 20px",
	borderRadius: 20,
	borderColor: "#cce1f6",
	margin: "5px",
	lineHeight: "30px",
	// the label of a removed entry
	"&.CcMultiSelectWithoutGroup-removed > span": {
		textDecoration: "line-through",
	},
});

// the text of a change that is not saved yet, after the label
const ChangeState = styled(Chip, {
	name: "CcMultiSelectWithoutGroup",
	slot: "changeState",
})(({ theme }) => ({
	marginInlineStart: 8,
	// on the paper rather than the chip's tint, where the text has its contrast
	backgroundColor: theme.palette.background.paper,
}));

const StyledInlineSwitch = styled(InlineSwitch, {
	name: "CcMultiSelectWithoutGroup",
	slot: "switch",
})({
	marginTop: 0,
});

/**
 * Slots of MultiSelectWithoutGroup (theme `CcMultiSelectWithoutGroup`, `classes`):
 * - `outlined`: a chip of a selected or removed entry; a removed entry's chip also has the
 *   class `CcMultiSelectWithoutGroup-removed`, an added entry's `CcMultiSelectWithoutGroup-added`
 * - `changeState`: the text of a change that is not saved yet ("Added", "Removed") in a chip
 * - `switch`: the switch beside the chips
 */
export type MultiSelectWithoutGroupClassKey =
	"outlined" | "changeState" | "switch";

const NO_ENTRIES: never[] = [];

/**
 * An entry as MultiSelectWithoutGroup lists it: a selected or a removed one
 */
interface ListedEntry<DataT extends MultiSelectorData> {
	data: DataT;
	changeState: MultiSelectChangeState | undefined;
}

const MultiSelectWithoutGroup = <DataT extends MultiSelectorData>(
	inProps: MultiSelectWithoutGroupProps<DataT>,
) => {
	const props = useThemeProps({
		props: inProps,
		name: "CcMultiSelectWithoutGroup",
	});
	const {
		onSelect,
		selected,
		added,
		removed: removedProp,
		disabled,
		enableIcons,
		loadDataOptions,
		getIdOfData,
		refreshToken,
		switchValue,
		sortCompareFn,
		classes,
		className,
		filterIds,
		...otherProps
	} = props;
	const { t } = useCCTranslations();

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	const removed = removedProp ?? NO_ENTRIES;

	const selectedIds = useMemo(() => selected.map(getId), [selected, getId]);
	const removedIds = useMemo(() => removed.map(getId), [removed, getId]);

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
		return sortCompareFn
			? entries.sort((a, b) => sortCompareFn(a.data, b.data))
			: entries;
	}, [added, removed, selected, sortCompareFn]);

	const handleDelete = useCallback(
		async (evt: React.MouseEvent<HTMLButtonElement>) => {
			evt.stopPropagation();
			if (!onSelect) return;

			// find the item
			const entryToDelete = selected.find(
				(s) => s.value === evt.currentTarget.name,
			);
			if (!entryToDelete) {
				throw new Error(
					"[Components-Care] [MultiSelectWithoutGroups] Entry couldn't be found. entry.value is not set",
				);
			}

			// check that we can delete the item
			if (
				entryToDelete.canUnselect &&
				!(await entryToDelete.canUnselect(entryToDelete, evt))
			) {
				return;
			}

			onSelect(selected.filter((entry) => entry !== entryToDelete));
		},
		[onSelect, selected],
	);

	const handleRestore = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			evt.stopPropagation();
			const entry = removed.find((s) => s.value === evt.currentTarget.name);
			if (!entry || !onSelect) return;
			onSelect([...selected, entry]);
		},
		[onSelect, removed, selected],
	);

	const multiSelectHandler = useCallback(
		(data: DataT | null) => {
			if (!data) return;
			const selectedOptions = [...selected, data];
			if (onSelect) onSelect(selectedOptions);
		},
		[onSelect, selected],
	);

	const onLoad = useCallback(
		async (query: string) => {
			const result = await loadDataOptions(query, !!switchValue);
			return {
				...result,
				options: result.options.map((entry) => {
					const id = getId(entry);
					if (selectedIds.includes(id))
						return { ...entry, isDisabled: true, selected: true };
					// a removed entry comes back through its restore button; hidden here by this
					// field's ids, as the search field compares filterIds by value
					if (removedIds.includes(id)) return { ...entry, hidden: true };
					return entry;
				}),
			};
		},
		[getId, loadDataOptions, removedIds, selectedIds, switchValue],
	);

	return (
		<Typography component="div" className={className}>
			<BaseSelector
				{...otherProps}
				onLoad={onLoad}
				disabled={disabled}
				selected={null}
				onSelect={multiSelectHandler}
				refreshToken={
					(refreshToken ?? "") +
					selectedIds.join(",") +
					(switchValue ?? false).toString()
				}
				variant={"standard"}
				startAdornment={
					<SearchIcon color={disabled ? "disabled" : "primary"} />
				}
				freeSolo={true}
				displaySwitch={false}
				filterIds={combinedFilterIds}
			/>
			<StyledInlineSwitch
				visible={!!props.displaySwitch}
				value={!!switchValue}
				onChange={props.setSwitchValue}
				label={props.switchLabel}
				disabled={disabled}
				className={classes?.switch}
			>
				<>
					{listed.map(({ data, changeState }, index: number) => {
						// a removed entry is restored where it would be removed
						const restorable = changeState === "removed";
						return (
							<Outlined
								key={index}
								className={combineClassNames([
									classes?.outlined,
									changeState && `CcMultiSelectWithoutGroup-${changeState}`,
								])}
							>
								{enableIcons && (
									<SmallListItemIcon>{data.icon}</SmallListItemIcon>
								)}
								<span>{data.label}</span>
								{changeState && (
									<ChangeState
										size={"small"}
										variant={"outlined"}
										color={changeState === "added" ? "success" : "default"}
										label={t(
											`standalone.selector.multi-select.change.${changeState}`,
										)}
										className={classes?.changeState}
									/>
								)}
								{!disabled && (
									<SmallIconButton
										edge={"end"}
										name={data.value}
										disabled={disabled}
										onClick={restorable ? handleRestore : handleDelete}
										aria-label={t(
											restorable
												? "standalone.selector.multi-select.restore-item"
												: "standalone.selector.multi-select.remove-item",
											{ ITEM: data.label },
										)}
									>
										{restorable ? <RestoreIcon /> : <RemoveIcon />}
									</SmallIconButton>
								)}
							</Outlined>
						);
					})}
				</>
			</StyledInlineSwitch>
		</Typography>
	);
};

export default React.memo(
	MultiSelectWithoutGroup,
) as typeof MultiSelectWithoutGroup;
