import React, { useCallback, useEffect, useState } from "react";
import { Search as SearchIcon, Cancel as RemoveIcon } from "@material-ui/icons";
import {
	BaseSelectorProps,
	MultiSelectorData,
} from "../../standalone/Selector";
import BaseSelector from "./BaseSelector";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import InlineSwitch from "../InlineSwitch";
import { makeStyles, Typography } from "@material-ui/core";

export interface MultiSelectWithoutGroupProps<DataT extends MultiSelectorData>
	extends Omit<
		BaseSelectorProps<DataT>,
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
	classes?: Partial<keyof ReturnType<typeof useStyles>>;
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
		switchValue: boolean
	) => DataT[] | Promise<DataT[]>;
	/**
	 * Optional callback for customizing the unique identifier of data
	 * @param data The data struct
	 * @returns A unique ID extracted from data
	 * @default returns data.value
	 */
	getIdOfData?: (data: DataT) => string;
	/**
	 * Token which causes data to be reloaded
	 */
	refreshToken?: string;
}

const useStyles = makeStyles(
	{
		outlined: {
			float: "left",
			backgroundColor: "#cce1f6",
			padding: "0px 20px",
			borderRadius: 20,
			borderColor: "#cce1f6",
			margin: "5px",
			lineHeight: "30px",
		},
		searchLabel: {
			lineHeight: "30px",
			float: "left",
		},
		switch: {
			lineHeight: "30px",
			width: "100%",
			direction: "rtl",
		},
		labelWithSwitch: {
			marginTop: 0,
		},
	},
	{ name: "CcMultiSelectWithoutGroup" }
);

const MultiSelectWithoutGroup = <DataT extends MultiSelectorData>(
	props: MultiSelectWithoutGroupProps<DataT>
) => {
	const {
		onSelect,
		selected,
		disabled,
		enableIcons,
		loadDataOptions,
		getIdOfData,
		refreshToken,
		switchValue,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		classes: classProps,
		...otherProps
	} = props;
	const classes = useStyles(props);
	const [dataOptions, setDataOptions] = useState<DataT[]>([]);

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	useEffect(() => {
		selected.map((selectedOption) => {
			setDataOptions((oldOptions) =>
				oldOptions.filter(
					(option) => !getId(option).includes(getId(selectedOption))
				)
			);
		});
	}, [getId, selected]);

	const handleDelete = useCallback(
		async (evt: React.MouseEvent<HTMLButtonElement>) => {
			if (!onSelect) return;

			// find the item
			const entryToDelete = selected.find(
				(s) => s.value === evt.currentTarget.name
			);
			if (!entryToDelete) {
				throw new Error(
					"[Components-Care] [MultiSelectWithoutGroups] Entry couldn't be found. entry.value is not set"
				);
			}

			// check that we can delete the item
			if (
				entryToDelete.canUnselect &&
				!(await entryToDelete.canUnselect(entryToDelete))
			) {
				return;
			}

			setDataOptions([...dataOptions, entryToDelete]);
			onSelect(selected.filter((entry) => entry !== entryToDelete));
		},
		[onSelect, setDataOptions, dataOptions, selected]
	);

	const multiSelectHandler = useCallback(
		(data: DataT | null) => {
			if (!data) return;
			const selectedOptions = [...selected, data];
			if (onSelect) onSelect(selectedOptions);
		},
		[onSelect, selected]
	);

	const onLoad = useCallback(
		async (query: string) => {
			return (await loadDataOptions(query, !!switchValue)).filter((entry) => {
				return !selected.map(getId).includes(getId(entry));
			});
		},
		[loadDataOptions, switchValue, selected, getId]
	);

	return (
		<Typography component="div">
			<BaseSelector
				{...otherProps}
				onLoad={onLoad}
				selected={null}
				onSelect={multiSelectHandler}
				refreshToken={
					(refreshToken ?? "") +
					selected.map(getId).join(",") +
					(switchValue ?? false).toString()
				}
				variant={"standard"}
				startAdornment={<SearchIcon color={"primary"} />}
				freeSolo={true}
				displaySwitch={false}
				getIdOfData={getIdOfData}
			/>
			<InlineSwitch
				visible={!!props.displaySwitch}
				value={!!switchValue}
				onChange={props.setSwitchValue}
				label={props.switchLabel}
				classes={classes}
			>
				<>
					{selected.map((data: MultiSelectorData, index: number) => {
						return (
							<div key={index} className={classes.outlined}>
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
							</div>
						);
					})}
				</>
			</InlineSwitch>
		</Typography>
	);
};

export default React.memo(
	MultiSelectWithoutGroup
) as typeof MultiSelectWithoutGroup;
