import React, { useCallback, useMemo } from "react";
import BaseSelector, {
	BaseSelectorData,
	BaseSelectorProps,
} from "./BaseSelector";
import { Grid, Paper } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import MultiSelectEntry, { IMultiSelectEntryProps } from "./MultiSelectEntry";
import { cleanClassMap, combineClassMaps } from "../../utils";
import { ClassNameMap } from "@mui/styles/withStyles";

export interface MultiSelectorData extends BaseSelectorData {
	/**
	 * Item click handler
	 */
	onClick?: () => void;
	/**
	 * Can the entry be unselected?
	 * @param data The data entry to be unselected
	 */
	canUnselect?: (data: MultiSelectorData) => boolean | Promise<boolean>;
	/**
	 * Disable delete button
	 */
	noDelete?: boolean;
}

export interface MultiSelectProps<DataT extends MultiSelectorData>
	extends Omit<BaseSelectorProps<DataT>, "onSelect" | "selected" | "classes"> {
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
	 * Specify a custom component for displaying multi select items
	 */
	selectedEntryRenderer?: React.ComponentType<IMultiSelectEntryProps<DataT>>;
	/**
	 * CSS classes to apply
	 */
	classes?: Partial<
		ClassNameMap<keyof ReturnType<typeof useMultiSelectorStyles>>
	>;
	/**
	 * Custom classes passed to subcomponents
	 */
	subClasses?: {
		baseSelector: BaseSelectorProps<BaseSelectorData>["classes"];
	};
	/**
	 * Sort function to perform a view-based sort on selected entries
	 * @remarks This is a comparison function
	 * @see Array.sort
	 */
	selectedSort?: (a: DataT, b: DataT) => number;
}

const useBaseSelectorStyles = makeStyles(
	(theme) => ({
		inputRoot: (props: MultiSelectProps<MultiSelectorData>) => ({
			borderRadius:
				props.selected.length > 0
					? `${theme.shape.borderRadius}px ${theme.shape.borderRadius}px 0px 0px`
					: undefined,
		}),
	}),
	{ name: "CcMultiSelectBase" }
);

const useMultiSelectorStyles = makeStyles(
	(theme) => ({
		selectedEntries: {
			border: `1px solid rgba(0, 0, 0, 0.23)`,
			borderTop: 0,
			borderRadius: `0px 0px ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
		},
	}),
	{ name: "CcMultiSelect" }
);

const MultiSelect = <DataT extends MultiSelectorData>(
	props: MultiSelectProps<DataT>
) => {
	const {
		onLoad,
		onSelect,
		selected,
		enableIcons,
		selectedEntryRenderer,
		disabled,
		getIdOfData,
		displaySwitch,
		switchLabel,
		defaultSwitchValue,
		selectedSort,
	} = props;
	const multiSelectClasses = useMultiSelectorStyles(props);
	const baseSelectorClasses = useBaseSelectorStyles(
		cleanClassMap(
			(props as unknown) as MultiSelectProps<MultiSelectorData>,
			true
		)
	);

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	const selectedIds = useMemo(() => selected.map(getId), [getId, selected]);

	const EntryRender: React.ComponentType<IMultiSelectEntryProps<DataT>> =
		selectedEntryRenderer || MultiSelectEntry;

	const multiSelectHandler = useCallback(
		(data: DataT | null) => {
			if (!data) return;
			const selectedOptions = [...selected, data];
			if (onSelect) onSelect(selectedOptions);
		},
		[onSelect, selected]
	);

	const multiSelectLoadHandler = useCallback(
		async (query: string, switchValue: boolean) => {
			const results = await onLoad(query, switchValue);
			return results.map((result) =>
				selectedIds.includes(getId(result))
					? { ...result, isDisabled: true, selected: true }
					: result
			);
		},
		[getId, onLoad, selectedIds]
	);

	const handleDelete = useCallback(
		(evt: React.MouseEvent<HTMLButtonElement>) => {
			let canDelete = true;
			const entry: MultiSelectorData | null | undefined = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!entry) {
				throw new Error(
					"[Components-Care] [MultiSelect] Entry couldn't be found. Either entry.value is not set, or the entity renderer does not correctly set the name attribute"
				);
			}
			void (async () => {
				if (entry.canUnselect) {
					canDelete = await entry.canUnselect(entry);
				}
				if (canDelete && onSelect) {
					const selectedOptions = selected.filter(
						(s) => s.value !== entry.value
					);
					onSelect(selectedOptions);
				}
			})();
		},
		[onSelect, selected]
	);

	const handleSetData = useCallback(
		(newValue: DataT) => {
			if (!onSelect) return;
			onSelect(
				selected.map((entry) =>
					getId(entry) === getId(newValue) ? newValue : entry
				)
			);
		},
		[getId, onSelect, selected]
	);

	return (
		<Grid container>
			<Grid item xs={12}>
				<BaseSelector
					{...props}
					classes={combineClassMaps(
						baseSelectorClasses,
						props.subClasses?.baseSelector
					)}
					onLoad={multiSelectLoadHandler}
					selected={null}
					onSelect={multiSelectHandler}
					refreshToken={selectedIds.join(",")}
					displaySwitch={displaySwitch}
					switchLabel={switchLabel}
					defaultSwitchValue={defaultSwitchValue}
				/>
			</Grid>
			{props.selected.length > 0 && (
				<Grid item xs={12} className={multiSelectClasses.selectedEntries}>
					<Paper elevation={0}>
						{(selectedSort
							? props.selected.sort(selectedSort)
							: props.selected
						).map((data: DataT, index: number) => (
							<EntryRender
								key={getId(data) || index.toString(16)}
								enableDivider={props.selected.length === index - 1}
								enableIcons={enableIcons}
								handleDelete={
									disabled || data.noDelete ? undefined : handleDelete
								}
								data={data}
								setData={handleSetData}
								iconSize={props.iconSize}
							/>
						))}
					</Paper>
				</Grid>
			)}
		</Grid>
	);
};

export default React.memo(MultiSelect) as typeof MultiSelect;
