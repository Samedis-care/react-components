import React, {
	useState,
	useCallback,
	useEffect,
	ReactElement,
	PropsWithChildren,
	ReactNodeArray,
	ForwardedRef,
	useMemo,
} from "react";
import {
	ListItemText,
	IconButton,
	InputLabel,
	Paper,
	InputProps,
	Divider,
	Typography,
	Popper,
} from "@material-ui/core";
import { Autocomplete, AutocompleteProps } from "@material-ui/lab";
import {
	Add as AddIcon,
	ExpandMore,
	Info as InfoIcon,
} from "@material-ui/icons";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
import {
	cleanClassMap,
	combineClassNames,
	SelectorSmallListItem,
	SmallListItemIcon,
} from "../..";
import { makeThemeStyles } from "../../utils";
import { makeStyles, Theme } from "@material-ui/core/styles";
import { Styles } from "@material-ui/core/styles/withStyles";
import {
	AutocompleteClassKey,
	AutocompleteRenderInputParams,
} from "@material-ui/lab/Autocomplete/Autocomplete";
import InputWithHelp from "../UIKit/InputWithHelp";
import OutlinedInputWithHelp from "../UIKit/OutlinedInputWithHelp";
import InlineSwitch from "../InlineSwitch";
import useCCTranslations from "../../utils/useCCTranslations";
import { PopperProps } from "@material-ui/core/Popper/Popper";

export interface BaseSelectorData {
	/**
	 * A unique value
	 */
	value: string;
	/**
	 * The label to show the user
	 * If [string, React.ReactNode] => string is used for search and won't be shown to use. ReactNode will be shown to user
	 */
	label: string | [string, React.ReactNode];
	/**
	 * The group of this item
	 */
	group?: string;
	/**
	 * An optional icon or img src
	 */
	icon?: React.ReactNode | string;
	/**
	 * Should the entry be ignored?
	 */
	ignore?: boolean;
	/**
	 * Should this entry be hidden from selection?
	 */
	hidden?: boolean;
	/**
	 * Should the entry be disabled?
	 */
	isDisabled?: boolean;
	/**
	 * Is this an add new button? (used for special handling in the renderer)
	 */
	isAddNewButton?: boolean;
	/**
	 * Is this entry a divider?
	 * Label and value won't be used. isDisabled will be forced to true
	 */
	isDivider?: boolean;
	/**
	 * Is this entry a small label?
	 * Label will be displayed, value won't be used. isDisabled will be forced to true
	 */
	isSmallLabel?: boolean;
	/**
	 * CSS styles for options
	 */
	className?: string;
}

export const getStringLabel = (data: BaseSelectorData) =>
	typeof data.label === "string" ? data.label : data.label[0];
export const getReactLabel = (data: BaseSelectorData) =>
	typeof data.label === "string" ? data.label : data.label[1];

export interface SelectorLruOptions<DataT extends BaseSelectorData> {
	/**
	 * The max amount of LRU cache entries
	 */
	count: number;
	/**
	 * The function to load the data associated with a LRU cache entry
	 * @param id The ID of the data (value in DataT)
	 * @remarks The return value is not cached
	 */
	loadData: (id: string) => Promise<DataT> | DataT;
	/**
	 * The LRU storage key
	 */
	storageKey: string;
	/**
	 * Do not load selector items if no search query is present
	 */
	forceQuery: boolean;
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
	 * Label which is shown if forceQuery == true and nothing has been typed
	 */
	startTypingToSearchText?: string | SelectorLabelCallback;
	/**
	 * Label which is shown for close icon button while popup is opened
	 */
	closeText?: string;
	/**
	 * Label which is shown for open icon button while popup is closed
	 */
	openText?: string;
	/**
	 * Label which is shown for the clear selected icon
	 */
	clearText?: string;
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
	/**
	 * Last recently used (LRU) cache options
	 * LRU shows the user the previous items he selected when no search term is entered
	 */
	lru?: SelectorLruOptions<DataT>;
	/**
	 * Enable freeSolo
	 */
	freeSolo?: boolean;
	/**
	 * Icon when no item is selected
	 */
	startAdornment?: InputProps["startAdornment"];
	/**
	 * Icon to show on the right of the selector
	 * @remarks Must be IconButton with padding: 2px; margin-right: -2px applied to it
	 */
	endAdornment?: InputProps["endAdornment"];
	/**
	 * Like endAdornment, but on the left side of the drop-down arrow
	 * @see endAdornment
	 */
	endAdornmentLeft?: InputProps["endAdornment"];
	/**
	 * Optional callback for customizing the unique identifier of data
	 * @param data The data struct
	 * @returns A unique ID extracted from data
	 * @default returns data.value
	 */
	getIdOfData?: (data: DataT) => string;
	/**
	 * Ids to filter from options
	 */
	filterIds?: string[] | undefined;
}

export type SelectorThemeExpert = {
	base?: Partial<
		Styles<Theme, BaseSelectorProps<BaseSelectorData>, AutocompleteClassKey>
	>;
	extensions?: Partial<
		Styles<
			Theme,
			BaseSelectorProps<BaseSelectorData>,
			SelectorCustomStylesClassKey
		>
	>;
};

const useCustomDefaultSelectorStyles = makeStyles(
	{
		root: {},
		focused: {},
		tag: {},
		tagSizeSmall: {},
		inputRoot: {},
		input: {},
		inputFocused: {},
		endAdornment: {},
		clearIndicator: {},
		clearIndicatorDirty: {},
		popupIndicator: {},
		popupIndicatorOpen: {},
		popper: {},
		popperDisablePortal: {},
		paper: {},
		listbox: {},
		loading: {},
		noOptions: {},
		groupLabel: {},
		groupUl: {},
		option: {
			padding: 0,
			'&[aria-disabled="true"]': {
				opacity: 1,
			},
		},
	},
	{ name: "CcBaseSelectorBase" }
);

const useThemeStyles = makeThemeStyles<
	BaseSelectorProps<BaseSelectorData>,
	AutocompleteClassKey
>(
	(theme) => theme.componentsCare?.uiKit?.baseSelectorExpert?.base,
	"CcBaseSelector",
	useCustomDefaultSelectorStyles
);

const useCustomStylesBase = makeStyles(
	(theme) => ({
		infoBtn: {
			padding: 2,
			marginRight: -2,
		},
		textFieldStandard: {
			position: "absolute",
		},
		switch: {
			marginTop: -30,
		},
		labelWithSwitch: {
			marginTop: 0,
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
		listItem: {
			paddingLeft: "16px !important",
			paddingRight: "16px !important",
			paddingTop: 6,
			paddingBottom: 6,
		},
		lruListItem: {
			backgroundColor: theme.palette.background.default,
			"&:hover": {
				backgroundColor: theme.palette.background.paper,
			},
		},
		smallLabel: {
			paddingLeft: 16,
			paddingTop: 4,
			color: theme.palette.text.disabled,
		},
		divider: {
			width: "100%",
		},
	}),
	{ name: "CcBaseSelectorCustomBase" }
);

export type SelectorCustomStylesClassKey = keyof ReturnType<
	typeof useCustomStylesBase
>;
const useCustomStyles = makeThemeStyles<
	BaseSelectorProps<BaseSelectorData>,
	SelectorCustomStylesClassKey
>(
	(theme) => theme.componentsCare?.uiKit?.baseSelectorExpert?.extensions,
	"CcBaseSelectorCustom",
	useCustomStylesBase
);

const variantInput: Record<
	NonNullable<BaseSelectorProps<BaseSelectorData>["variant"]>,
	React.ComponentType<InputProps>
> = {
	outlined: OutlinedInputWithHelp,
	standard: InputWithHelp,
};

const getOptionDisabled = (option: BaseSelectorData) =>
	!!(option.isDisabled || option.isDivider || option.isSmallLabel);
const getOptionSelected = (option: BaseSelectorData, value: BaseSelectorData) =>
	option.value === value.value;

const GrowPopper = React.forwardRef(function GrowPopperImpl(
	props: PopperProps,
	ref: ForwardedRef<HTMLDivElement>
) {
	return (
		<Popper
			{...props}
			ref={ref}
			style={{ ...props.style, width: "unset", minWidth: props.style?.width }}
		/>
	);
});

export interface BaseSelectorContextType {
	addToLru: (...ids: string[]) => void;
}
export const BaseSelectorContext = React.createContext<BaseSelectorContextType | null>(
	null
);

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
		startTypingToSearchText,
		openText,
		closeText,
		clearText,
		disableClearable,
		openInfo,
		grouped,
		noGroupLabel,
		disableGroupSorting,
		groupSorter,
		switchLabel,
		lru,
		startAdornment,
		endAdornment,
		endAdornmentLeft,
		freeSolo,
		getIdOfData,
		filterIds,
	} = props;

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	const classes = useThemeStyles(
		(props as unknown) as BaseSelectorProps<BaseSelectorData>
	);
	const defaultSwitchValue = !!(
		props.displaySwitch && props.defaultSwitchValue
	);
	const [switchValue, setSwitchValue] = useState<boolean>(defaultSwitchValue);
	const { t } = useCCTranslations();
	const customClasses = useCustomStyles(
		cleanClassMap(
			(props as unknown) as BaseSelectorProps<BaseSelectorData>,
			true
		)
	);
	const [open, setOpen] = useState(false);
	const actualAddNewLabel = addNewLabel || t("standalone.selector.add-new");
	const [selectorOptions, setSelectorOptions] = useState<DataT[]>([]);
	const [loading, setLoading] = useState<string | null>(null);
	const [query, setQuery] = useState("");

	const [lruIds, setLruIds] = useState<string[]>(() => {
		if (!lru) return [];
		try {
			const ret: unknown = JSON.parse(
				localStorage?.getItem(lru.storageKey) ?? "[]"
			);
			if (
				!Array.isArray(ret) ||
				(ret as unknown[]).find((entry) => typeof entry !== "string")
			)
				return []; // LRU != string[]
			return (ret as string[]).slice(0, lru.count);
		} catch (e) {
			return []; // json parse error
		}
	});

	// save LRU ids
	useEffect(() => {
		if (!lru?.storageKey) return;
		localStorage?.setItem(lru.storageKey, JSON.stringify(lruIds));
	}, [lruIds, lru?.storageKey]);

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
		(data: BaseSelectorData) => {
			if (data.isDivider) return <Divider className={customClasses.divider} />;
			if (data.isSmallLabel)
				return (
					<Typography variant={"caption"} className={customClasses.smallLabel}>
						{getReactLabel(data)}
					</Typography>
				);

			return (
				<SelectorSmallListItem
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore: Typescript complains about the button property being "required"
					component={"div"}
					className={combineClassNames([
						customClasses.listItem,
						data.className,
					])}
					style={data.isDisabled ? { opacity: 0.38 } : undefined}
				>
					{enableIcons && (
						<SmallListItemIcon>{renderIcon(data.icon)}</SmallListItemIcon>
					)}
					<ListItemText>{getReactLabel(data)}</ListItemText>
				</SelectorSmallListItem>
			);
		},
		[enableIcons, renderIcon, customClasses]
	);

	const addToLru = useCallback(
		(...addIds: string[]) => {
			if (!lru) return;
			setLruIds((prev) =>
				[...addIds, ...prev.filter((id) => !addIds.includes(id))].slice(
					0,
					lru.count
				)
			);
		},
		[lru]
	);

	const onChangeHandler = useCallback(
		async (data: DataT | NonNullable<DataT> | null) => {
			if (!data || typeof data !== "object" || !("value" in data)) {
				if (data) {
					// eslint-disable-next-line no-console
					console.warn(
						"[Components-Care] [BaseSelector] Unexpected value passed to handleOptionSelect:",
						data
					);
					return;
				}
			}
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
				if (data != null) {
					addToLru(getId(data as DataT));
				}
			}
		},
		[onSelect, onAddNew, addToLru, getId]
	);

	const context = useMemo<BaseSelectorContextType>(
		() => ({
			addToLru,
		}),
		[addToLru]
	);

	const onSearchHandler = useCallback(
		async (query: string) => {
			const addNewEntry = {
				value: "add-new-button",
				label: actualAddNewLabel,
				icon: <AddIcon />,
				isAddNewButton: true,
			} as DataT;

			const loadTicket = Math.random().toString();
			setLoading(loadTicket);
			let results: DataT[];
			const filteredLruIds = filterIds
				? lruIds.filter((id) => !filterIds.includes(id))
				: lruIds;
			if (
				lru &&
				query === "" &&
				(filteredLruIds.length > 0 || lru.forceQuery)
			) {
				results = [
					onAddNew ? addNewEntry : undefined,
					filteredLruIds.length > 0 && onAddNew
						? ({
								label: "",
								value: "lru-divider",
								isDivider: true,
						  } as DataT)
						: undefined,
					filteredLruIds.length > 0
						? ({
								label: t("standalone.selector.base-selector.lru-label"),
								value: "lru-label",
								isSmallLabel: true,
						  } as DataT)
						: undefined,
					...((
						await Promise.all(
							filteredLruIds.map((id) =>
								(async (id: string): Promise<DataT> => lru.loadData(id))(
									id
								).catch(() => undefined)
							)
						)
					).filter((e) => !!e) as DataT[]).map((entry) => ({
						...entry,
						className: combineClassNames([
							customClasses.lruListItem,
							entry.className,
						]),
					})),
				].filter((entry) => entry) as DataT[];
			} else {
				results = [...(await onLoad(query, switchValue))];
				if (onAddNew) {
					if (results.length > 0) {
						results.push({
							label: "",
							value: "lru-divider",
							isDivider: true,
						} as DataT);
					}
					results.push(addNewEntry);
				}
			}
			// remove hidden
			results = results.filter((result) => !result.hidden);

			if (filterIds) {
				results = results.filter((entry) => !filterIds.includes(getId(entry)));
			}
			if (grouped && !disableGroupSorting) {
				results.sort(
					groupSorter ??
						((a, b) =>
							-(b.group ?? noGroupLabel ?? "").localeCompare(
								a.group ?? noGroupLabel ?? ""
							))
				);
			}
			setLoading((prev) => {
				// if another load was started while completing this skip update
				if (prev != loadTicket) return prev;
				// otherwise update and finish loading
				setSelectorOptions(results);
				return null;
			});
		},
		[
			t,
			actualAddNewLabel,
			lru,
			lruIds,
			grouped,
			disableGroupSorting,
			customClasses.lruListItem,
			onLoad,
			switchValue,
			onAddNew,
			groupSorter,
			noGroupLabel,
			filterIds,
			getId,
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
			classes={customClasses}
		>
			<BaseSelectorContext.Provider value={context}>
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
						loading={!!loading}
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
						PopperComponent={GrowPopper}
						filterOptions={filterOptions}
						value={selected}
						inputValue={query}
						blurOnSelect={true}
						onInputChange={updateQuery}
						popupIcon={<ExpandMore />}
						freeSolo={freeSolo}
						noOptionsText={
							lru && query === ""
								? startTypingToSearchText ??
								  t(
										"standalone.selector.base-selector.start-typing-to-search-text"
								  )
								: noOptionsText ??
								  t("standalone.selector.base-selector.no-options-text")
						}
						openText={
							openText ?? t("standalone.selector.base-selector.open-icon-text")
						}
						closeText={
							closeText ??
							t("standalone.selector.base-selector.close-icon-text")
						}
						clearText={
							clearText ??
							t("standalone.selector.base-selector.clear-icon-text")
						}
						getOptionLabel={getStringLabel}
						renderOption={defaultRenderer}
						getOptionDisabled={getOptionDisabled}
						getOptionSelected={getOptionSelected}
						onChange={(_event, selectedValue) =>
							onChangeHandler(selectedValue as DataT)
						}
						renderInput={(params: AutocompleteRenderInputParams) => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { InputProps, InputLabelProps, ...otherParams } = params;
							return (
								<InputComponent
									readOnly={disableSearch}
									{...InputProps}
									{...otherParams}
									inputProps={{
										...params.inputProps,
										title: selected ? getStringLabel(selected) : undefined,
									}}
									startAdornment={
										(enableIcons ? renderIcon(selected?.icon) : undefined) ??
										startAdornment
									}
									endAdornment={(() => {
										const hasAdditionalElements =
											openInfo || endAdornment || endAdornmentLeft;
										return hasAdditionalElements
											? React.cloneElement(
													params.InputProps?.endAdornment as ReactElement,
													{},
													endAdornmentLeft,
													...((params.InputProps?.endAdornment as ReactElement<
														PropsWithChildren<unknown>
													>).props.children as ReactNodeArray),
													openInfo && (
														<IconButton
															onClick={openInfo}
															className={customClasses.infoBtn}
														>
															<InfoIcon color={"disabled"} />
														</IconButton>
													),
													endAdornment
											  )
											: params.InputProps?.endAdornment;
									})()}
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
			</BaseSelectorContext.Provider>
		</InlineSwitch>
	);
};

export default React.memo(BaseSelector) as typeof BaseSelector;
