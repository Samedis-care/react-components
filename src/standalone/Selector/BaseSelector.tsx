import React, {
	ForwardedRef,
	PropsWithChildren,
	ReactElement,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	Autocomplete,
	AutocompleteChangeReason,
	Divider,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	InputProps,
	ListItemText,
	Paper,
	Popper,
	styled,
	TextFieldProps,
	Typography,
	useThemeProps,
} from "@mui/material";
import {
	Add as AddIcon,
	ExpandMore,
	Info as InfoIcon,
} from "@mui/icons-material";
import TextFieldWithHelp, {
	TextFieldWithHelpProps,
} from "../UIKit/TextFieldWithHelp";
import {
	SelectorSmallListItemButton,
	SmallListItemIcon,
} from "../../standalone/Small";
import combineClassNames from "../../utils/combineClassNames";
import { useLocalStorageState } from "../../utils/useStorageState";
import { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import InlineSwitch from "../InlineSwitch";
import useCCTranslations from "../../utils/useCCTranslations";
import { PopperProps } from "@mui/material/Popper/Popper";
import uniqueArray from "../../utils/uniqueArray";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import { InputProps as StandardInputProps } from "@mui/material/Input/Input";
import Checkbox from "../UIKit/Checkbox";
import { AutocompleteRenderOptionState } from "@mui/material/Autocomplete/Autocomplete";

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
	 * HTML title attribute override
	 */
	titleTooltip?: string;
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
	 * Should the entry be marked selected
	 */
	selected?: boolean;
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
	/**
	 * Free solo flag (user entered data)
	 */
	freeSolo?: boolean;
}

export const getStringLabel = (data: BaseSelectorData | string) =>
	typeof data === "string"
		? data
		: Array.isArray(data.label)
			? data.label[0]
			: data.label;
export const getReactLabel = (data: BaseSelectorData) =>
	Array.isArray(data.label) ? data.label[1] : data.label;

export const modifyReactLabel = <DataT extends BaseSelectorData>(
	data: DataT,
	cb: (prev: React.ReactNode) => React.ReactNode,
): DataT => ({
	...data,
	label: [getStringLabel(data), cb(getReactLabel(data))],
});

/**
 * On load handler for selectors using a local dataset
 * Performs a case-insensitive label search
 * @param data The data set
 */
export const selectorLocalLoadHandler =
	(data: BaseSelectorData[]) => (query: string) => {
		query = query.toLowerCase();
		return uniqueArray([
			...data.filter((entry) =>
				getStringLabel(entry).toLowerCase().startsWith(query),
			),
			...data.filter((entry) =>
				getStringLabel(entry).toLowerCase().includes(query),
			),
		]);
	};

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

export interface BaseSelectorSingle<DataT extends BaseSelectorData> {
	multiple?: false;
	/**
	 * Callback for autocomplete change
	 */
	onSelect: (selected: DataT | null) => void;
	/**
	 * The currently selected values
	 */
	selected: DataT | null;
}

export interface BaseSelectorMulti<DataT extends BaseSelectorData> {
	multiple: true;
	/**
	 * Callback for autocomplete change
	 */
	onSelect: (selected: DataT[]) => void;
	/**
	 * The currently selected values
	 */
	selected: DataT[];
}

export type BaseSelectorVariants<
	DataT extends BaseSelectorData,
	Multi extends boolean,
> = Multi extends true
	? BaseSelectorMulti<DataT>
	: Multi extends false
		? BaseSelectorSingle<DataT>
		: never;

export type BaseSelectorProps<
	DataT extends BaseSelectorData,
	Multi extends boolean,
> = TextFieldWithHelpProps &
	BaseSelectorVariants<DataT, Multi> & {
		/**
		 * Refresh token used to force refreshing data.
		 */
		refreshToken?: string;
		/**
		 * Data load function
		 * @param search The user search input
		 * @param switchValue The value of switch input
		 * @remarks When using this with an already loaded dataset consider using selectorLocalLoadHandler
		 */
		onLoad: (
			search: string,
			switchValue: boolean,
		) => DataT[] | Promise<DataT[]>;
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
		 * Required of input
		 */
		required?: boolean;
		/**
		 * Error state of input
		 */
		error?: boolean;
		/**
		 * Warning state of input
		 */
		warning?: boolean;
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
		noOptionsText?: string;
		/**
		 * Label which is shown while loading data
		 */
		loadingText?: string;
		/**
		 * Label which is shown if forceQuery == true and nothing has been typed
		 */
		startTypingToSearchText?: string;
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
		 * CSS class name to apply
		 */
		className?: string;
		/**
		 * Custom styles to be used for selector
		 */
		classes?: Partial<Record<BaseSelectorClassKey, string>>;
		/**
		 * Custom styles used for selector input (text field)
		 */
		textFieldClasses?: TextFieldProps["classes"];
		/**
		 * Custom styles used for selector input (text field input)
		 */
		textFieldInputClasses?:
			| OutlinedInputProps["classes"]
			| StandardInputProps["classes"];
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
		 * Do not show results unless search string is entered
		 */
		forceQuery?: boolean;
		/**
		 * Enable freeSolo. Allows user to enter any content. Selected option will be { value: USER_INPUT, label: USER_INPUT }
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
	};

const StyledAutocomplete = styled(Autocomplete, {
	name: "CcBaseSelector",
	slot: "autocomplete",
})({
	"& .MuiAutocomplete-option": {
		padding: 0,
		'&[aria-disabled="true"]': {
			opacity: 1,
		},
	},
}) as typeof Autocomplete;

const StyledInlineSwitch = styled(InlineSwitch, {
	name: "CcBaseSelector",
	slot: "inlineSwitch",
})({
	marginTop: 0,
	"& .CcInlineSwitch-switchWrapper": {
		marginTop: -30,
	},
});

const StyledLabel = styled(InputLabel, {
	name: "CcBaseSelector",
	slot: "label",
})({
	position: "relative",
	transform: "translate(0,0) scale(0.75)",
	zIndex: "unset",
});

export interface BaseSelectorIconOwnerState {
	iconSize?: number;
}
const StyledIcon = styled("img", {
	name: "CcBaseSelector",
	slot: "icon",
})<{ ownerState: BaseSelectorIconOwnerState }>(
	({ ownerState: { iconSize } }) => ({
		width: iconSize ?? 32,
		height: iconSize ?? 32,
		objectFit: "contain",
	}),
);

const StyledDivider = styled(Divider, {
	name: "CcBaseSelector",
	slot: "divider",
})({
	width: "100%",
}) as typeof Divider;

const SmallLabelOption = styled(Typography, {
	name: "CcBaseSelector",
	slot: "smallLabel",
})(({ theme }) => ({
	paddingLeft: 16,
	paddingTop: 4,
	color: theme.palette.text.disabled,
})) as typeof Typography;

const StyledCheckbox = styled(Checkbox, {
	name: "CcBaseSelector",
	slot: "checkbox",
})({
	borderRadius: 4,
	width: 16,
	height: 16,
	marginRight: 10,
});

const SelectedMarker = styled(Grid, {
	name: "CcBaseSelector",
	slot: "selected",
})(({ theme }) => ({
	borderRadius: theme.shape.borderRadius,
	backgroundColor: theme.palette.secondary.main,
	padding: `calc(${theme.spacing(1)} / 2) ${theme.spacing(1)}`,
}));

export const BaseSelectorLruOptionCssClassName =
	"components-care-base-selector-lru-option";
const OptionListItem = styled(SelectorSmallListItemButton, {
	name: "CcBaseSelector",
	slot: "listItem",
})(({ theme }) => ({
	paddingLeft: "16px !important",
	paddingRight: "16px !important",
	paddingTop: 6,
	paddingBottom: 6,
	[`&.${BaseSelectorLruOptionCssClassName}`]: {
		backgroundColor: theme.palette.background.default,

		"&:hover": {
			backgroundColor: theme.palette.background.paper,
		},
	},
})) as typeof SelectorSmallListItemButton;

const Wrapper = styled(Paper, { name: "CcBaseSelector", slot: "wrapper" })({});

const InfoButton = styled(IconButton, {
	name: "CcBaseSelector",
	slot: "infoBtn",
})({
	padding: 2,
	marginRight: -2,
});

export type BaseSelectorClassKey =
	| "autocomplete"
	| "inlineSwitch"
	| "label"
	| "icon"
	| "divider"
	| "smallLabel"
	| "checkbox"
	| "selected"
	| "listItem"
	| "wrapper"
	| "infoBtn";
const getOptionDisabled = (option: BaseSelectorData) =>
	!!(!option || option.isDisabled || option.isDivider || option.isSmallLabel);
const getOptionSelected = (option: BaseSelectorData, value: BaseSelectorData) =>
	option.value === value.value;

const GrowPopper = React.forwardRef(function GrowPopperImpl(
	props: PopperProps,
	ref: ForwardedRef<HTMLDivElement>,
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
export const BaseSelectorContext =
	React.createContext<BaseSelectorContextType | null>(null);

const BaseSelector = <DataT extends BaseSelectorData, Multi extends boolean>(
	inProps: BaseSelectorProps<DataT, Multi>,
) => {
	const props = useThemeProps({ props: inProps, name: "CcBaseSelector" });
	const {
		variant,
		refreshToken,
		onSelect,
		multiple,
		selected,
		label,
		disabled,
		required,
		error,
		warning,
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
		forceQuery,
		freeSolo,
		getIdOfData,
		filterIds,
		textFieldClasses,
		textFieldInputClasses,
		iconSize,
		classes,
		className,
	} = props;

	const getIdDefault = useCallback((data: DataT) => data.value, []);
	const getId = getIdOfData ?? getIdDefault;

	const defaultSwitchValue = !!(
		props.displaySwitch && props.defaultSwitchValue
	);
	const [switchValue, setSwitchValue] = useState<boolean>(defaultSwitchValue);
	const { t } = useCCTranslations();
	const [open, setOpen] = useState(false);
	const actualAddNewLabel = addNewLabel || t("standalone.selector.add-new");
	const [selectorOptions, setSelectorOptions] = useState<DataT[]>([]);
	const [loading, setLoading] = useState<string | null>(null);
	const [query, setQuery] = useState("");

	const [lruIds, setLruIds] = useLocalStorageState<string[]>(
		lru?.storageKey,
		[],
		(ret): ret is string[] =>
			Array.isArray(ret) &&
			!(ret as unknown[]).find((entry) => typeof entry !== "string"),
	);

	const renderIcon = useCallback(
		(icon: string | React.ReactNode) =>
			typeof icon === "string" ? (
				<StyledIcon
					src={icon}
					alt={""}
					ownerState={{ iconSize }}
					className={classes?.icon}
				/>
			) : (
				icon
			),
		[iconSize, classes?.icon],
	);

	const defaultRenderer = useCallback(
		(
			props: React.HTMLAttributes<HTMLLIElement>,
			data: BaseSelectorData,
			state: AutocompleteRenderOptionState,
		) => {
			const { selected } = state;
			if (data.isDivider)
				return (
					<StyledDivider
						component={"li"}
						{...props}
						onClick={undefined}
						onMouseMove={undefined}
						onTouchStart={undefined}
						key={data.value}
						className={classes?.divider}
					/>
				);
			if (data.isSmallLabel)
				return (
					<SmallLabelOption
						component={"li"}
						{...props}
						key={data.value}
						onClick={undefined}
						onMouseMove={undefined}
						onTouchStart={undefined}
						variant={"caption"}
						className={classes?.smallLabel}
					>
						{getReactLabel(data)}
					</SmallLabelOption>
				);

			return (
				<OptionListItem
					component={"li"}
					{...props}
					key={data.value}
					className={combineClassNames([
						classes?.listItem,
						data.className,
						props.className,
					])}
					disabled={data.isDisabled}
				>
					{multiple && (
						<SmallListItemIcon>
							<StyledCheckbox
								checked={selected}
								className={classes?.checkbox}
							/>
						</SmallListItemIcon>
					)}
					{enableIcons && (
						<SmallListItemIcon>{renderIcon(data.icon)}</SmallListItemIcon>
					)}
					<ListItemText>
						<Grid container>
							<Grid size="grow">{getReactLabel(data)}</Grid>
							{data.selected && (
								<SelectedMarker className={classes?.selected}>
									{t("standalone.selector.base-selector.selected")}
								</SelectedMarker>
							)}
						</Grid>
					</ListItemText>
				</OptionListItem>
			);
		},
		[
			multiple,
			classes?.divider,
			classes?.smallLabel,
			classes?.listItem,
			classes?.selected,
			classes?.checkbox,
			enableIcons,
			renderIcon,
			t,
		],
	);

	const addToLru = useCallback(
		(...addIds: string[]) => {
			if (!lru) return;
			setLruIds((prev) =>
				[...addIds, ...prev.filter((id) => !addIds.includes(id))].slice(
					0,
					lru.count,
				),
			);
		},
		[lru, setLruIds],
	);

	const onChangeHandler = useCallback(
		async (
			data: Multi extends true ? (string | DataT)[] : (string | DataT) | null,
			reason: AutocompleteChangeReason,
		) => {
			if (
				multiple
					? !Array.isArray(data)
					: !data ||
						!["string", "object"].includes(typeof data) ||
						(typeof data === "object" && !("value" in data))
			) {
				if (data) {
					// eslint-disable-next-line no-console
					console.warn(
						"[Components-Care] [BaseSelector] Unexpected value passed to handleOptionSelect:",
						data,
					);
					return;
				}
			}
			const dataNormalized: DataT[] = multiple
				? // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
					((data as (DataT | string)[]).map((entry) =>
						typeof entry === "string"
							? ({
									value: entry,
									label: entry,
									freeSolo: true,
								} as unknown as DataT)
							: entry,
					) as DataT[])
				: data
					? [
							typeof data === "string"
								? ({
										value: data,
										label: data,
										freeSolo: true,
									} as unknown as DataT)
								: (data as DataT),
						]
					: [];
			const selectedNormalized: DataT[] = multiple
				? selected
				: selected
					? [selected]
					: [];
			if (
				dataNormalized.length > 0 &&
				dataNormalized[dataNormalized.length - 1].isAddNewButton
			) {
				// if not free solo auto select on blur
				if (reason !== "blur") {
					if (!onAddNew) return;
					const created = await onAddNew();
					if (!created) return;
					setSelectorOptions((old) => [created, ...old]);
					dataNormalized[dataNormalized.length - 1] = created;
				} else {
					// make sure we don't select this element
					dataNormalized.pop();
					setQuery("");
				}
			}
			setQuery("");
			if (onSelect) {
				if (multiple) {
					onSelect(dataNormalized);
				} else {
					onSelect(dataNormalized[0] ?? null);
				}
				if (
					multiple
						? dataNormalized.length > selectedNormalized.length
						: dataNormalized.length > 0
				) {
					const lastRecord = dataNormalized[dataNormalized.length - 1];
					if (!lastRecord.freeSolo) addToLru(getId(lastRecord));
				}
			}
		},
		[onSelect, onAddNew, multiple, selected, addToLru, getId],
	);

	const context = useMemo<BaseSelectorContextType>(
		() => ({
			addToLru,
		}),
		[addToLru],
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
					...(
						(
							await Promise.all(
								filteredLruIds.map((id) =>
									(async (id: string): Promise<DataT> => lru.loadData(id))(
										id,
									).catch((e) => {
										// remove IDs from LRU on backend error
										if (
											e instanceof Error &&
											(e.name === "BackendError" ||
												e.name === "RequestBatchingError")
										) {
											setLruIds((ids) => ids.filter((oId) => oId !== id));
										}
										return undefined;
									}),
								),
							)
						).filter((e) => !!e) as DataT[]
					).map((entry) => ({
						...entry,
						className: combineClassNames([
							BaseSelectorLruOptionCssClassName,
							entry.className,
						]),
					})),
				].filter((entry) => entry) as DataT[];
			} else {
				results =
					query === "" && forceQuery
						? []
						: [...(await onLoad(query, switchValue))];
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
								a.group ?? noGroupLabel ?? "",
							)),
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
			actualAddNewLabel,
			filterIds,
			lruIds,
			lru,
			grouped,
			disableGroupSorting,
			onAddNew,
			t,
			setLruIds,
			forceQuery,
			onLoad,
			switchValue,
			getId,
			groupSorter,
			noGroupLabel,
		],
	);

	const updateQuery = useCallback(
		(_evt: React.SyntheticEvent, newQuery: string) => {
			if (multiple && newQuery.length > 1) {
				newQuery = newQuery
					.substring(selected.map(getStringLabel).join(", ").length)
					.trimStart();
			}
			setQuery(newQuery);
		},
		[multiple, selected],
	);

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

	// lru change
	useEffect(() => {
		if (query) return;
		void onSearchHandler("");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [lruIds.join(",")]);

	const filterOptions = useCallback((options: DataT[]) => options, []);

	return (
		<StyledInlineSwitch
			visible={!!props.displaySwitch}
			value={switchValue}
			onChange={setSwitchValue}
			label={switchLabel}
			className={combineClassNames([className, classes?.inlineSwitch])}
		>
			<BaseSelectorContext.Provider value={context}>
				{label && (
					<StyledLabel
						shrink
						disableAnimation
						disabled={disabled}
						className={classes?.label}
						required={!!required}
						error={!!error}
					>
						{label}
					</StyledLabel>
				)}
				<Wrapper elevation={0} className={classes?.wrapper}>
					<StyledAutocomplete
						id={autocompleteId}
						className={classes?.autocomplete}
						multiple={multiple}
						disableCloseOnSelect={multiple}
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
						options={(() => {
							let options = [];
							// add selected to selectorOptions if not present to suppress warnings
							const selectedArr = multiple
								? selected
								: selected
									? [selected]
									: [];
							// free solo option
							if (
								freeSolo &&
								query &&
								!(
									selectorOptions.find(
										(entry) => getStringLabel(entry) === query,
									) ||
									selectedArr.find((entry) => getStringLabel(entry) === query)
								)
							)
								options.push({
									label: query,
									value: query,
									freeSolo: true,
								} as unknown as DataT);

							if (multiple) options = options.concat(selectedArr); // multiple select: show selected on top
							options = options.concat(selectorOptions);
							if (!multiple) options = options.concat(selectedArr); // single/multi select: add selected to avoid warning
							// unique array
							options = options.filter(
								(value, idx, arr) =>
									arr.findIndex((v2) => v2.value === value.value) === idx,
							);
							return options;
						})()}
						groupBy={
							grouped
								? (option: DataT) => option.group ?? noGroupLabel ?? ""
								: undefined
						}
						slots={{ popper: GrowPopper }}
						filterOptions={filterOptions}
						value={selected}
						inputValue={query}
						blurOnSelect={!multiple}
						onInputChange={updateQuery}
						popupIcon={<ExpandMore />}
						autoSelect={freeSolo}
						freeSolo={freeSolo}
						noOptionsText={
							lru && query === ""
								? (startTypingToSearchText ??
									t(
										"standalone.selector.base-selector.start-typing-to-search-text",
									))
								: (noOptionsText ??
									t("standalone.selector.base-selector.no-options-text"))
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
						isOptionEqualToValue={getOptionSelected}
						onChange={(_event, selectedValue, reason) =>
							onChangeHandler(
								selectedValue as Multi extends true ? DataT[] : DataT | null,
								reason,
							)
						}
						renderInput={(params: AutocompleteRenderInputParams) => {
							// eslint-disable-next-line @typescript-eslint/no-unused-vars
							const { InputProps, InputLabelProps, ...otherParams } = params;
							return (
								<TextFieldWithHelp
									variant={variant ?? "outlined"}
									{...otherParams}
									classes={textFieldClasses}
									slotProps={{
										htmlInput: {
											...params.inputProps,
											readOnly: disableSearch,
											title:
												selected && !multiple
													? (selected.titleTooltip ?? getStringLabel(selected))
													: undefined,
											value: multiple
												? [
														selected.map(getStringLabel).join(", "),
														params.inputProps.value,
													].join(" ")
												: params.inputProps.value,
										},
										input: {
											...InputProps,
											classes: textFieldInputClasses,
											readOnly: disableSearch,
											startAdornment:
												(enableIcons && !multiple
													? renderIcon(selected?.icon)
													: undefined) ?? startAdornment,
											endAdornment: (() => {
												const hasAdditionalElements =
													openInfo || endAdornment || endAdornmentLeft;
												const infoBtn = openInfo && (
													<InfoButton
														onClick={openInfo}
														className={classes?.infoBtn}
													>
														<InfoIcon color={"disabled"} />
													</InfoButton>
												);
												return hasAdditionalElements ? (
													params.InputProps?.endAdornment ? (
														React.cloneElement(
															params.InputProps?.endAdornment as ReactElement,
															{},
															endAdornmentLeft,
															...((
																params.InputProps?.endAdornment as ReactElement<
																	PropsWithChildren<unknown>
																>
															).props.children as ReactNode[]),
															infoBtn,
															endAdornment,
														)
													) : (
														<InputAdornment position={"end"}>
															{endAdornmentLeft}
															{infoBtn}
															{endAdornment}
														</InputAdornment>
													)
												) : (
													params.InputProps?.endAdornment
												);
											})(),
										},
									}}
									placeholder={placeholder}
									onChange={(event) => {
										void onSearchHandler(event.target.value);
									}}
									required={required}
									error={error}
									warning={warning}
								/>
							);
						}}
						key={`${refreshToken || "no-refresh-token"} ${
							onAddNew
								? `add-new${actualAddNewLabel || "no-add-new-label"}`
								: "no-add-new"
						}`}
					/>
				</Wrapper>
			</BaseSelectorContext.Provider>
		</StyledInlineSwitch>
	);
};

export default React.memo(BaseSelector) as typeof BaseSelector;
