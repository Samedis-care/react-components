import React, { useState, useCallback, useEffect } from "react";
import { TextFieldProps, ListItemText } from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import { Add as AddIcon, ExpandMore } from "@material-ui/icons";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../UIKit/TextFieldWithHelp";
import i18n from "../../i18n";
import { SelectorSmallListItem, SmallListItemIcon } from "../..";

export interface BaseSelectorData {
	/**
	 * A unique value
	 */
	value: string;
	/**
	 * The label to show the user
	 */
	label: string;
	/**
	 * An optional icon
	 */
	icon?: React.ReactNode;
	/**
	 * Should the entry be disabled?
	 */
	isDisabled?: boolean;
	/**
	 * Is this an add new button? (used for special handling in the renderer)
	 */
	isAddNewButton?: boolean;
}

/**
 * A callback used to get an label value for a specific input (search) value
 */
type SelectorLabelCallback = (obj: { inputValue: string }) => string | null;

export interface BaseSelectorProps extends TextFieldWithHelpProps {
	/**
	 * Refresh token used to force refreshing data.
	 * Does not work with truthy multiSelect
	 */
	refreshToken?: string;
	/**
	 * Data load function
	 * @param search The user search input
	 */
	onLoad: (search: string) => BaseSelectorData[] | Promise<BaseSelectorData[]>;
	/**
	 * Selector default options
	 */
	defaultOptions?: BaseSelectorData[];
	/**
	 * Callback for autocomplete change
	 */
	onSelect: (selected: BaseSelectorData | null) => void;
	/**
	 * Disable autocomplete control
	 */
	disabled?: boolean;
	/**
	 * String used for the Autocomplete component
	 */
	autocompleteId?: string;
	/**
	 * String used to set place holded of the Autocomplete component
	 */
	placeholder?: string;
	/**
	 * Handler for the "Add new" button
	 * Add new button only shows if this is set.
	 */
	onAddNew?: () => void;
	/**
	 * Label for the "Add new" button
	 */
	addNewLabel?: string;
	/**
	 * The currently selected values
	 */
	selected: BaseSelectorData | null;
	/**
	 * Enables icons in the list renderers
	 */
	enableIcons?: boolean;
	/**
	 * Label which is shown if there is no data
	 */
	noOptionsText?: string | SelectorLabelCallback;
	/**
	 * Label which is shown while loading data
	 */
	loadingText?: string | SelectorLabelCallback;
	/**
	 * Is the selector clearable?
	 */
	disableClearable?: boolean;
	/**
	 * Custom styles to be used for selector
	 */
	classes?: AutocompleteProps<
		unknown,
		undefined,
		undefined,
		undefined
	>["classes"];
}

const BaseSelector = (props: BaseSelectorProps) => {
	const {
		classes,
		defaultOptions,
		refreshToken,
		onSelect,
		selected,
		disabled,
		placeholder,
		autocompleteId,
		addNewLabel,
		onLoad,
		onAddNew,
		enableIcons,
		noOptionsText,
		loadingText,
		disableClearable,
	} = props;
	const [open, setOpen] = useState(false);
	const actualAddNewLabel =
		addNewLabel || i18n.t("standalone.selector.add-new");
	const [selectorOptions, setSelectorOptions] = useState(
		[] as BaseSelectorData[]
	);
	const [loading, setLoading] = useState(false);

	const defaultRenderer = useCallback(
		(data: BaseSelectorData) => (
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: Typescript complains about the button property being "required"
			<SelectorSmallListItem>
				{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
				<ListItemText>{data.label}</ListItemText>
			</SelectorSmallListItem>
		),
		[enableIcons]
	);

	const onChangeHandler = useCallback(
		(data) => {
			if (
				data &&
				"isAddNewButton" in data &&
				(data as BaseSelectorData).isAddNewButton
			) {
				if (onAddNew) onAddNew();
				return;
			} else {
				if (onSelect) onSelect(data);
			}
		},
		[onSelect, onAddNew]
	);

	const onSearchHandler = useCallback(
		async (query: string) => {
			setLoading(true);
			const results = await onLoad(query);
			if (onAddNew) {
				results.push({
					value: "add-new-button",
					label: actualAddNewLabel,
					icon: <AddIcon />,
					isAddNewButton: true,
				} as BaseSelectorData);
			}
			setSelectorOptions(results);
			setLoading(false);
		},
		[actualAddNewLabel, onAddNew, onLoad, setLoading]
	);

	const setDefaultOptions = useCallback(() => {
		let options = defaultOptions || [];
		if (onAddNew) {
			options.push({
				value: "add-new-button",
				label: actualAddNewLabel,
				icon: <AddIcon />,
				isAddNewButton: true,
			} as BaseSelectorData);
		} else {
			options = options.filter((option) => !option.isAddNewButton);
		}
		return options;
	}, [actualAddNewLabel, defaultOptions, onAddNew]);

	useEffect(() => {
		if (!open) {
			setSelectorOptions(setDefaultOptions);
		}
	}, [open, setDefaultOptions]);

	return (
		<div>
			<Autocomplete
				id={autocompleteId}
				classes={classes}
				open={open}
				onOpen={() => {
					setOpen(true);
				}}
				onClose={() => {
					setOpen(false);
				}}
				disableClearable={disableClearable}
				loading={loading}
				loadingText={loadingText}
				autoComplete
				disabled={disabled}
				options={selectorOptions}
				value={selected}
				popupIcon={<ExpandMore />}
				noOptionsText={noOptionsText}
				getOptionLabel={(option: BaseSelectorData) => option.label}
				renderOption={(option: BaseSelectorData) => defaultRenderer(option)}
				getOptionDisabled={(option: BaseSelectorData) => !!option.isDisabled}
				onChange={(_event, selectedValue) => onChangeHandler(selectedValue)}
				renderInput={(params: TextFieldProps) => (
					<TextFieldWithHelp
						{...params}
						variant="outlined"
						placeholder={placeholder}
						onChange={(event) => {
							if (event.target.value !== "" || event.target.value !== null) {
								void onSearchHandler(event.target.value);
							}
						}}
					/>
				)}
				key={`${refreshToken || "no-refresh-token"} ${
					onAddNew
						? `add-new${actualAddNewLabel || "no-add-new-label"}`
						: "no-add-new"
				}`}
			/>
		</div>
	);
};

export default React.memo(BaseSelector);
