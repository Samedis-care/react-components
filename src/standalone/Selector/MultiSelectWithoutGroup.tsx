import React, { useCallback, useEffect, useState } from "react";
import { TextFieldProps, Typography, makeStyles } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Search as SearchIcon, Cancel as RemoveIcon } from "@material-ui/icons";
import {
	BaseSelectorProps,
	MultiSelectorData,
} from "../../standalone/Selector";
import { BaseSelectorData } from "./BaseSelector";

import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../UIKit/TextFieldWithHelp";
import { SmallIconButton, SmallListItemIcon } from "../Small";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import InlineSwitch from "../InlineSwitch";

/**
 * A callback used to get an label value for a specific input (search) value
 */
type SelectorLabelCallback = (obj: { inputValue: string }) => string | null;
export interface MultiSelectWithoutGroupProps<DataT extends MultiSelectorData>
	extends Pick<
			BaseSelectorProps<BaseSelectorData>,
			| "disabled"
			| "autocompleteId"
			| "enableIcons"
			| "displaySwitch"
			| "defaultSwitchValue"
			| "switchLabel"
		>,
		TextFieldWithHelpProps {
	// UI Props
	/**
	 * Label for search input control
	 */
	searchInputLabel?: string;
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
	 * Change event callback
	 * @param data The currently selected entries. This should be feed back to selected prop
	 */
	onChange?: (data: DataT[]) => void;
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
	/**
	 * Label which is shown if there is no data
	 */
	noOptionsText?: string | SelectorLabelCallback;
	/**
	 * Label which is shown while loading data
	 */
	loadingText?: string | SelectorLabelCallback;
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
		searchInputLabel,
		selected,
		disabled,
		autocompleteId,
		enableIcons,
		loadDataOptions,
		onChange,
		openInfo,
		getIdOfData,
		refreshToken,
		noOptionsText,
		loadingText,
		switchValue,
	} = props;
	const { t } = useTranslation(undefined, { i18n });
	const classes = useStyles(props);
	const [dataQuery, setDataQuery] = useState("");
	const [dataOptions, setDataOptions] = useState<DataT[]>([]);
	const [loading, setLoading] = useState(false);

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
			if (!onChange) return;

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
			onChange(selected.filter((entry) => entry !== entryToDelete));
		},
		[onChange, setDataOptions, dataOptions, selected]
	);

	const handleOptionSelect = useCallback(
		(selectedValue: DataT) => {
			if (
				!selectedValue ||
				typeof selectedValue !== "object" ||
				!("value" in selectedValue) ||
				!onChange
			) {
				if (selectedValue) {
					// eslint-disable-next-line no-console
					console.warn(
						"[Components-Care] [MultiSelectWithoutGroup] Unexpected value passed to handleOptionSelect:",
						selectedValue
					);
				}
				return;
			}
			setLoading(true);
			setDataQuery("");
			setDataOptions(
				dataOptions.filter((old) => getId(old) !== getId(selectedValue))
			);
			onChange([...selected, selectedValue]);
			setLoading(false);
		},
		[getId, onChange, setDataOptions, dataOptions, selected]
	);

	const onSearchData = useCallback(
		async (query: string) => {
			const selectedIds = selected.map(getId);
			setDataOptions(
				(await loadDataOptions(query, !!switchValue)).filter(
					(option) => !selectedIds.includes(getId(option))
				)
			);
		},
		[getId, loadDataOptions, setDataOptions, selected, switchValue]
	);

	useEffect(() => {
		void onSearchData(dataQuery);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dataQuery, switchValue, refreshToken]);

	const filterOptions = useCallback((options: DataT[]) => options, []);

	return (
		<Typography component="div">
			<Typography component="div" className={classes.searchLabel}>
				<Typography
					component="label"
					variant={"caption"}
					color={"textSecondary"}
				>
					{searchInputLabel || "Search input"}
				</Typography>
			</Typography>
			<Autocomplete<DataT, false, true, true>
				id={autocompleteId}
				freeSolo
				autoComplete
				disableClearable
				disabled={disabled}
				options={dataOptions}
				filterOptions={filterOptions}
				value={""}
				getOptionSelected={(option, value) => option.value === value.value}
				getOptionLabel={(option: string | DataT) =>
					typeof option === "string" ? option : option.label
				}
				onChange={(_event, selectedValue) =>
					handleOptionSelect(selectedValue as DataT)
				}
				inputValue={dataQuery}
				onInputChange={(evt, value) => setDataQuery(value)}
				loading={loading}
				loadingText={
					loadingText ?? t("standalone.selector.base-selector.loading-text")
				}
				noOptionsText={
					noOptionsText ??
					t("standalone.selector.base-selector.no-options-text")
				}
				renderInput={(params: TextFieldProps) => (
					<TextFieldWithHelp
						{...params}
						openInfo={openInfo}
						InputProps={{
							...params.InputProps,
							startAdornment: <SearchIcon color={"primary"} />,
							type: "search",
						}}
					/>
				)}
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
