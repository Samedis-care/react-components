import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	Cancel as RemoveIcon,
	Search as SearchIcon,
} from "@mui/icons-material";
import {
	BaseSelectorProps,
	MultiSelectorData,
} from "../../standalone/Selector";
import BaseSelector from "./BaseSelector";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import InlineSwitch from "../InlineSwitch";
import { styled, Typography, useThemeProps } from "@mui/material";

export interface MultiSelectWithoutGroupProps<DataT extends MultiSelectorData>
	extends Omit<
		BaseSelectorProps<DataT, false>,
		"onSelect" | "selected" | "classes" | "onLoad"
	> {
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
	 * @param query The search string
	 * @param switchValue The value of the switch or false if switch is disabled
	 */
	loadDataOptions: (
		query: string,
		switchValue: boolean,
	) => DataT[] | Promise<DataT[]>;
	/**
	 * Optional callback for customizing the unique identifier of data
	 * @param data The data struct
	 * @returns A unique ID extracted from data
	 * @default returns data.value
	 */
	getIdOfData?: (data: DataT) => string;
	/**
	 * Comparison function for client side sorting
	 */
	sortCompareFn?: (value1: DataT, value2: DataT) => number;
}

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
});

const StyledInlineSwitch = styled(InlineSwitch, {
	name: "CcMultiSelectWithoutGroup",
	slot: "switch",
})({
	marginTop: 0,
	"& .CcInlineSwitch-switchWrapper": {
		lineHeight: "30px",
		width: "100%",
		direction: "rtl",
	},
});

export type MultiSelectWithoutGroupClassKey = "outlined" | "switch";

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
		disabled,
		enableIcons,
		loadDataOptions,
		getIdOfData,
		refreshToken,
		switchValue,
		sortCompareFn,
		classes,
		className,
		...otherProps
	} = props;
	const [dataOptions, setDataOptions] = useState<DataT[]>([]);

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	const selectedIds = useMemo(() => selected.map(getId), [selected, getId]);

	useEffect(() => {
		selected.map((selectedOption) => {
			setDataOptions((oldOptions) =>
				oldOptions.filter(
					(option) => !getId(option).includes(getId(selectedOption)),
				),
			);
		});
	}, [getId, selected]);

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

			setDataOptions([...dataOptions, entryToDelete]);
			onSelect(selected.filter((entry) => entry !== entryToDelete));
		},
		[onSelect, setDataOptions, dataOptions, selected],
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
			const results = await loadDataOptions(query, !!switchValue);
			return results.map((result) =>
				selectedIds.includes(getId(result))
					? { ...result, isDisabled: true, selected: true }
					: result,
			);
		},
		[getId, loadDataOptions, selectedIds, switchValue],
	);

	return (
		<Typography component="div" className={className}>
			<BaseSelector
				{...otherProps}
				onLoad={onLoad}
				selected={null}
				onSelect={multiSelectHandler}
				refreshToken={
					(refreshToken ?? "") +
					selectedIds.join(",") +
					(switchValue ?? false).toString()
				}
				variant={"standard"}
				startAdornment={<SearchIcon color={"primary"} />}
				freeSolo={true}
				displaySwitch={false}
				filterIds={selected.map(getId)}
			/>
			<StyledInlineSwitch
				visible={!!props.displaySwitch}
				value={!!switchValue}
				onChange={props.setSwitchValue}
				label={props.switchLabel}
				className={classes?.switch}
			>
				<>
					{(sortCompareFn ? selected.sort(sortCompareFn) : selected).map(
						(data: MultiSelectorData, index: number) => {
							return (
								<Outlined key={index} className={classes?.outlined}>
									{enableIcons && (
										<SmallListItemIcon>{data.icon}</SmallListItemIcon>
									)}
									<span>{data.label}</span>
									{!disabled && (
										<SmallIconButton
											edge={"end"}
											name={data.value}
											disabled={disabled}
											onClick={handleDelete}
										>
											<RemoveIcon />
										</SmallIconButton>
									)}
								</Outlined>
							);
						},
					)}
				</>
			</StyledInlineSwitch>
		</Typography>
	);
};

export default React.memo(
	MultiSelectWithoutGroup,
) as typeof MultiSelectWithoutGroup;
