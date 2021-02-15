import React, {
	useState,
	useCallback,
	useEffect,
	ReactElement,
	PropsWithChildren,
	ReactNodeArray,
} from "react";
import { ListItemText, IconButton } from "@material-ui/core";
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
import OutlinedInputWithHelp from "../UIKit/OutlinedInputWithHelp";

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
	 */
	onLoad: (search: string) => DataT[] | Promise<DataT[]>;
	/**
	 * Callback for autocomplete change
	 */
	onSelect: (selected: DataT | null) => void;
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
	 */
	onAddNew?: () => void;
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
	 * Is the selector clearable?
	 */
	disableClearable?: boolean;
	/**
	 * Disable search?
	 */
	disableSearch?: boolean;
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
		icon: (props: Pick<BaseSelectorProps<BaseSelectorData>, "iconSize">) => ({
			width: props.iconSize ?? 32,
			height: props.iconSize ?? 32,
			objectFit: "contain",
		}),
	},
	{ name: "CcBaseSelectorCustom" }
);

const BaseSelector = <DataT extends BaseSelectorData>(
	props: BaseSelectorProps<DataT>
) => {
	const {
		refreshToken,
		onSelect,
		selected,
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
		disableClearable,
		openInfo,
	} = props;
	const classes = useThemeStyles(
		(props as unknown) as BaseSelectorProps<BaseSelectorData>
	);
	const customClasses = useCustomStyles(cleanClassMap(props, true));
	const [open, setOpen] = useState(false);
	const actualAddNewLabel =
		addNewLabel || i18n.t("standalone.selector.add-new");
	const [selectorOptions, setSelectorOptions] = useState(
		[] as BaseSelectorData[]
	);
	const [loading, setLoading] = useState(false);
	const [query, setQuery] = useState("");

	const defaultRenderer = useCallback(
		(data: BaseSelectorData) => (
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: Typescript complains about the button property being "required"
			<SelectorSmallListItem component={"div"}>
				{enableIcons && (
					<SmallListItemIcon>
						{typeof data.icon === "string" ? (
							<img src={data.icon} alt={""} className={customClasses.icon} />
						) : (
							data.icon
						)}
					</SmallListItemIcon>
				)}
				<ListItemText>{data.label}</ListItemText>
			</SelectorSmallListItem>
		),
		[customClasses.icon, enableIcons]
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
				} as DataT);
			}
			setSelectorOptions(results);
			setLoading(false);
		},
		[actualAddNewLabel, onAddNew, onLoad, setLoading]
	);

	const updateQuery = useCallback((_, newQuery: string) => {
		setQuery(newQuery);
	}, []);

	// initial option load
	useEffect(() => {
		void onSearchHandler(query);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, refreshToken]);

	useEffect(() => {
		void onSearchHandler("");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selected]);

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
				options={
					// add selected to selectorOptions if not present to suppress warnings
					selected &&
					!selectorOptions.find((option) => option.value === selected.value)
						? selectorOptions.concat([selected])
						: selectorOptions
				}
				value={selected}
				inputValue={query}
				onInputChange={updateQuery}
				popupIcon={<ExpandMore />}
				noOptionsText={noOptionsText}
				getOptionLabel={(option: BaseSelectorData) => option.label}
				renderOption={(option: BaseSelectorData) => defaultRenderer(option)}
				getOptionDisabled={(option: BaseSelectorData) => !!option.isDisabled}
				getOptionSelected={(option, value) => option.value === value.value}
				onChange={(_event, selectedValue) => onChangeHandler(selectedValue)}
				renderInput={(params: AutocompleteRenderInputParams) => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { InputProps, InputLabelProps, ...otherParams } = params;
					return (
						<OutlinedInputWithHelp
							readOnly={disableSearch}
							{...InputProps}
							{...otherParams}
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
		</div>
	);
};

export default React.memo(BaseSelector) as typeof BaseSelector;
