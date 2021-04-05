import React, {
	useState,
	useCallback,
	useEffect,
	ReactElement,
	PropsWithChildren,
	ReactNodeArray,
} from "react";
import {
	ListItemText,
	IconButton,
	InputLabel,
	Paper,
	InputProps,
} from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import {
	Add as AddIcon,
	ExpandMore,
	Info as InfoIcon,
} from "@material-ui/icons";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
import i18n from "../../i18n";
import { cleanClassMap, SelectorSmallListItem, SmallListItemIcon } from "../..";
import { makeThemeStyles } from "../../utils";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Styles } from "@material-ui/core/styles/withStyles";
import {
	AutocompleteClassKey,
	AutocompleteRenderInputParams,
} from "@material-ui/lab/Autocomplete/Autocomplete";
import InputWithHelp from "../UIKit/InputWithHelp";
import OutlinedInputWithHelp from "../UIKit/OutlinedInputWithHelp";
import { useTranslation } from "react-i18next";
import InlineSwitch from "../InlineSwitch";

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
	 * The group of this item
	 */
	group?: string;
	/**
	 * An optional icon or img src
	 */
	icon?: React.ReactNode | string;
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

export interface BaseSelectorProps<DataT extends BaseSelectorData>
	extends TextFieldWithHelpProps {
	/**
	 * Refresh token used to force refreshing data.
	 */
	refreshToken?: string;
	/**
	 * Data load function
	 * @param search The user search input
	 * @param switchValue The value of switch input
	 */
	onLoad: (search: string, switchValue: boolean) => DataT[] | Promise<DataT[]>;
	/**
	 * Callback for autocomplete change
	 */
	onSelect: (selected: DataT | null) => void;
	/**
	 * The textfield type of input
	 */
	variant?: "outlined" | "standard";
	/**
	 * The label of the selector
	 */
	label?: string;
	/**
	 * Disable autocomplete control
	 */
	disabled?: boolean;
	/**
	 * String used for the Autocomplete component
	 */
	autocompleteId?: string;
	/**
	 * String used to set placeholder of the Autocomplete component
	 */
	placeholder?: string;
	/**
	 * Handler for the "Add new" button
	 * Add new button only shows if this is set.
	 * @returns The newly created data entry which will be selected or null if user cancelled
	 */
	onAddNew?: () => DataT | null | Promise<DataT | null>;
	/**
	 * Label for the "Add new" button
	 */
	addNewLabel?: string;
	/**
	 * The currently selected values
	 */
	selected: DataT | null;
	/**
	 * Enables icons in the list renderers
	 */
	enableIcons?: boolean;
	/**
	 * Size of the icons (if enableIcons) in px
	 */
	iconSize?: number;
	/**
	 * Label which is shown if there is no data
	 */
	noOptionsText?: string | SelectorLabelCallback;
	/**
	 * Label which is shown while loading data
	 */
	loadingText?: string | SelectorLabelCallback;
	/**
	 * Label which is shown for close icon button while popup is opened
	 */
	closeText?: string;
	/**
	 * Label which is shown for open icon button while popup is closed
	 */
	openText?: string;
	/**
	 * Is the selector clearable?
	 */
	disableClearable?: boolean;
	/**
	 * Disable search?
	 */
	disableSearch?: boolean;
	/**
	 * Enable grouping
	 */
	grouped?: boolean;
	/**
	 * Label used if no group is set
	 */
	noGroupLabel?: string;
	/**
	 * Disable group sorting
	 */
	disableGroupSorting?: boolean;
	/**
	 * Group sorting algorithm
	 * @see Array.sort
	 */
	groupSorter?: (a: DataT, b: DataT) => number;
	/**
	 * Custom styles to be used for selector
	 */
	classes?: AutocompleteProps<
		unknown,
		undefined,
		undefined,
		undefined
	>["classes"];
	/**
	 * Display switch control?
	 */
	displaySwitch?: boolean;
	/**
	 * Default value for switch position
	 */
	defaultSwitchValue?: boolean;
	/**
	 * Label for switch control (only used if displaySwitch is truthy)
	 */
	switchLabel?: React.ReactNode;
}

export type SelectorThemeExpert = Partial<
	Styles<Theme, BaseSelectorProps<BaseSelectorData>, AutocompleteClassKey>
>;

const useThemeStyles = makeThemeStyles<
	BaseSelectorProps<BaseSelectorData>,
	AutocompleteClassKey
>((theme) => theme.componentsCare?.uiKit?.baseSelectorExpert, "CcBaseSelector");

const useCustomStyles = makeStyles(
	{
		infoBtn: {
			padding: 2,
			marginRight: -2,
		},
		textFieldStandard: {
			position: "absolute",
		},
		icon: (
			props: Pick<BaseSelectorProps<BaseSelectorData>, "iconSize" | "label">
		) => ({
			width: props.iconSize ?? 32,
			height: props.iconSize ?? 32,
			objectFit: "contain",
		}),
		wrapper: (
			props: Pick<BaseSelectorProps<BaseSelectorData>, "iconSize" | "label">
		) => ({
			marginTop: props.label ? 16 : undefined,
		}),
	},
	{ name: "CcBaseSelectorCustom" }
);

const variantInput: Record<
	NonNullable<BaseSelectorProps<BaseSelectorData>["variant"]>,
	React.ComponentType<InputProps>
> = {
	outlined: OutlinedInputWithHelp,
	standard: InputWithHelp,
};

const useStyles = makeStyles({
	switch: {
		marginTop: -30,
	},
});

const BaseSelector = <DataT extends BaseSelectorData>(
	props: BaseSelectorProps<DataT>
) => {
	const {
		variant,
		refreshToken,
		onSelect,
		selected,
		label,
		disabled,
		disableSearch,
		placeholder,
		autocompleteId,
		addNewLabel,
		onLoad,
		onAddNew,
		enableIcons,
		noOptionsText,
		loadingText,
		openText,
		closeText,
		disableClearable,
		openInfo,
		grouped,
		noGroupLabel,
		disableGroupSorting,
		groupSorter,
		switchLabel,
	} = props;
	const classes = useThemeStyles(
		(props as unknown) as BaseSelectorProps<BaseSelectorData>
	);
	const customClassesSwitch = useStyles();
	const defaultSwitchValue = !!(
		props.displaySwitch && props.defaultSwitchValue
	);
	const [switchValue, setSwitchValue] = useState<boolean>(defaultSwitchValue);
	const { t } = useTranslation(undefined, { i18n });
	const customClasses = useCustomStyles(cleanClassMap(props, true));
	const [open, setOpen] = useState(false);
	const actualAddNewLabel = addNewLabel || t("standalone.selector.add-new");
	const [selectorOptions, setSelectorOptions] = useState<DataT[]>([]);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");

	const renderIcon = useCallback(
		(icon: string | React.ReactNode) =>
			typeof icon === "string" ? (
				<img src={icon} alt={""} className={customClasses.icon} />
			) : (
				icon
			),
		[customClasses.icon]
	);

	const defaultRenderer = useCallback(
		(data: BaseSelectorData) => (
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: Typescript complains about the button property being "required"
			<SelectorSmallListItem component={"div"}>
				{enableIcons && (
					<SmallListItemIcon>{renderIcon(data.icon)}</SmallListItemIcon>
				)}
				<ListItemText>{data.label}</ListItemText>
			</SelectorSmallListItem>
		),
		[enableIcons, renderIcon]
	);

	const onChangeHandler = useCallback(
		async (data) => {
			if (
				data &&
				"isAddNewButton" in data &&
				(data as BaseSelectorData).isAddNewButton
			) {
				if (!onAddNew) return;
				const created = await onAddNew();
				if (!created) return;
				setSelectorOptions((old) => [created, ...old]);
				data = created;
			}
			if (onSelect) {
				onSelect(data);
			}
		},
		[onSelect, onAddNew]
	);

	const onSearchHandler = useCallback(
		async (query: string) => {
			setLoading(true);
			const results = await onLoad(query, !!switchValue);
			if (onAddNew) {
				results.push({
					value: "add-new-button",
					label: actualAddNewLabel,
					icon: <AddIcon />,
					isAddNewButton: true,
				} as DataT);
			}
			if (grouped && !disableGroupSorting) {
				setSelectorOptions(
					results.sort(
						groupSorter ??
							((a, b) =>
								-(b.group ?? noGroupLabel ?? "").localeCompare(
									a.group ?? noGroupLabel ?? ""
								))
					)
				);
			} else {
				setSelectorOptions(results);
			}
			setLoading(false);
		},
		[
			onLoad,
			switchValue,
			onAddNew,
			grouped,
			disableGroupSorting,
			actualAddNewLabel,
			groupSorter,
			noGroupLabel,
		]
	);

	const updateQuery = useCallback((_, newQuery: string) => {
		setQuery(newQuery);
	}, []);

	// search handler
	useEffect(() => {
		if (!open) return;
		void onSearchHandler(query);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, switchValue]);

	// initial option load and reset options upon selection
	useEffect(() => {
		void onSearchHandler("");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected, switchValue, refreshToken]);

	const filterOptions = useCallback((options: DataT[]) => options, []);

	const InputComponent = variantInput[variant ?? "outlined"];

	return (
		<InlineSwitch
			visible={!!props.displaySwitch}
			value={switchValue}
			onChange={setSwitchValue}
			label={switchLabel}
			classes={customClassesSwitch}
		>
			<>
				{label && <InputLabel shrink>{label}</InputLabel>}
				<Paper elevation={0} className={customClasses.wrapper}>
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
						loadingText={
							loadingText ?? t("standalone.selector.base-selector.loading-text")
						}
						autoComplete
						disabled={disabled}
						selectOnFocus={!disableSearch}
						options={
							// add selected to selectorOptions if not present to suppress warnings
							selected &&
							!selectorOptions.find((option) => option.value === selected.value)
								? selectorOptions.concat([selected])
								: selectorOptions
						}
						groupBy={
							grouped
								? (option: DataT) => option.group ?? noGroupLabel ?? ""
								: undefined
						}
						filterOptions={filterOptions}
						value={selected}
						inputValue={query}
						blurOnSelect={true}
						onInputChange={updateQuery}
						popupIcon={<ExpandMore />}
						noOptionsText={
							noOptionsText ??
							t("standalone.selector.base-selector.no-options-text")
						}
						openText={
							openText ?? t("standalone.selector.base-selector.open-icon-text")
						}
						closeText={
							closeText ??
							t("standalone.selector.base-selector.close-icon-text")
						}
						getOptionLabel={(option: BaseSelectorData) => option.label}
						renderOption={(option: BaseSelectorData) => defaultRenderer(option)}
						getOptionDisabled={(option: BaseSelectorData) =>
							!!option.isDisabled
						}
						getOptionSelected={(option, value) => option.value === value.value}
						onChange={(_event, selectedValue) => onChangeHandler(selectedValue)}
						renderInput={(params: AutocompleteRenderInputParams) => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { InputProps, InputLabelProps, ...otherParams } = params;
							return (
								<InputComponent
									readOnly={disableSearch}
									{...InputProps}
									{...otherParams}
									startAdornment={
										enableIcons ? renderIcon(selected?.icon) : undefined
									}
									endAdornment={
										openInfo
											? React.cloneElement(
													params.InputProps?.endAdornment as ReactElement,
													{},
													...((params.InputProps?.endAdornment as ReactElement<
														PropsWithChildren<unknown>
													>).props.children as ReactNodeArray),
													<IconButton
														onClick={openInfo}
														className={customClasses.infoBtn}
													>
														<InfoIcon color={"disabled"} />
													</IconButton>
											  )
											: params.InputProps?.endAdornment
									}
									placeholder={placeholder}
									onChange={(event) => {
										void onSearchHandler(event.target.value);
									}}
								/>
							);
						}}
						key={`${refreshToken || "no-refresh-token"} ${
							onAddNew
								? `add-new${actualAddNewLabel || "no-add-new-label"}`
								: "no-add-new"
						}`}
					/>
				</Paper>
			</>
		</InlineSwitch>
	);
};

export default React.memo(BaseSelector) as typeof BaseSelector;
