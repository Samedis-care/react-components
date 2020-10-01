import React, { CSSProperties } from "react";
import AsyncSelect from "react-select/async";
import { FormatOptionLabelMeta } from "react-select/src/Select";
import { ListItemText, useTheme } from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import { ControlProps, Styles, ValueType } from "react-select";
import { SelectorSmallListItem, SmallListItemIcon } from "../..";
import i18n from "../../i18n";

export interface SelectorData {
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

export interface SelectorPropsSingleSelect<Data extends SelectorData>
	extends SelectorProps<Data> {
	/**
	 * Extended selection change handler
	 * @param data The selected data entry/entries
	 */
	onSelect?: (value: Data | null) => void;
	/**
	 * The currently selected values
	 */
	selected: Data | null;
	/**
	 * Can the selector select multiple values
	 */
	multiSelect?: false;
}

export interface SelectorPropsMultiSelect<Data extends SelectorData>
	extends SelectorProps<Data> {
	/**
	 * Extended selection change handler
	 * @param data The selected data entry/entries
	 */
	onSelect?: (value: Data[]) => void;
	/**
	 * The currently selected values
	 */
	selected: Data[];
	/**
	 * Can the selector select multiple values
	 */
	multiSelect: true;
}

interface SelectorProps<Data extends SelectorData> {
	/**
	 * Data load function
	 * @param search The user search input
	 */
	onLoad: (search: string) => Data[] | Promise<Data[]>;
	/**
	 * Is the selector disabled?
	 */
	disable?: boolean;
	/**
	 * Is the selector clearable?
	 */
	clearable?: boolean;
	/**
	 * Enables icons in the list renderers
	 */
	enableIcons?: boolean;

	/**
	 * Label which is shown if no entries are selected
	 */
	placeholderLabel?: string;
	/**
	 * Label which is shown if there is no data
	 */
	noDataLabel?: string | SelectorLabelCallback;
	/**
	 * Label which is shown while loading data
	 */
	loadingLabel?: string | SelectorLabelCallback;
	/**
	 * Custom entry renderer
	 * @param option The option to render
	 * @param labelMeta The meta data for the option
	 */
	renderEntry?: (
		option: Data,
		labelMeta: FormatOptionLabelMeta<Data>
	) => React.ReactNode;

	/**
	 * Refresh token used to force refreshing data.
	 * Does not work with truthy multiSelect
	 */
	refreshToken?: string;

	/**
	 * Label for the "Add new" button
	 */
	addNewLabel?: string;
	/**
	 * Handler for the "Add new" button
	 * Add new button only shows if this is set.
	 */
	onAddNew?: () => void;
	/**
	 * Custom styles for the selector
	 */
	customStyles?: Styles;
}

/**
 * Controlled selector (react-select) with simple API.
 * This component shouldn't be used directly,
 * please look into SingleSelect and MultiSelect instead.
 */
const Selector = <Data extends SelectorData>(
	props: SelectorPropsSingleSelect<Data> | SelectorPropsMultiSelect<Data>
) => {
	const {
		onLoad,
		placeholderLabel,
		noDataLabel,
		loadingLabel,
		selected,
		disable,
		enableIcons,
		multiSelect,
		onSelect,
		renderEntry,
		refreshToken,
		addNewLabel,
		onAddNew,
		customStyles,
		clearable,
	} = props;

	const theme = useTheme();

	const selectorStyles = React.useMemo(() => {
		const {
			option,
			control,
			valueContainer,
			placeholder,
			...otherCustomStyles
		} = customStyles || {};

		return {
			option: (base: CSSProperties): CSSProperties => {
				let selectorOptionStyles: CSSProperties = {
					...base,
					padding: 0,
					paddingLeft: 8,
				};

				if (option)
					selectorOptionStyles = option(selectorOptionStyles, undefined);

				return selectorOptionStyles;
			},
			control: (
				base: CSSProperties,
				controlProps: ControlProps<Record<string, unknown>>
			): CSSProperties => {
				let selectorControlStyles: CSSProperties = {
					...base,
					minHeight: 64,
				};

				if (control)
					selectorControlStyles = control(selectorControlStyles, controlProps);

				return selectorControlStyles;
			},
			valueContainer: (base: CSSProperties): CSSProperties => {
				let selectorValueContainerStyles: CSSProperties = {
					...base,
					padding: 0,
					paddingLeft: 8,
				};

				if (valueContainer)
					selectorValueContainerStyles = valueContainer(
						selectorValueContainerStyles,
						undefined
					);

				return selectorValueContainerStyles;
			},
			placeholder: (base: CSSProperties): CSSProperties => {
				let selectorPlaceholderStyles: CSSProperties = {
					...base,
					padding: "0 4px",
					margin: 0,
					...theme.typography.body1,
				};

				if (placeholder)
					selectorPlaceholderStyles = placeholder(
						selectorPlaceholderStyles,
						{}
					);

				return selectorPlaceholderStyles;
			},
			...otherCustomStyles,
		};
	}, [customStyles, theme]);

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getNoOptionsLabel = React.useCallback(
		noDataLabel
			? typeof noDataLabel === "string"
				? () => noDataLabel
				: noDataLabel
			: () => null,
		[noDataLabel]
	);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const getLoadingLabel = React.useCallback(
		loadingLabel
			? typeof loadingLabel === "string"
				? () => loadingLabel
				: loadingLabel
			: () => null,
		[loadingLabel]
	);
	const onChangeHandler = React.useCallback(
		(data: ValueType<Data>) => {
			if (data && "isAddNewButton" in data && data.isAddNewButton) {
				if (onAddNew) onAddNew();
				return;
			}
			if (onSelect) {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore due to lack of templating support in react-select
				onSelect(data);
			}
		},
		[onSelect, onAddNew]
	);
	const defaultRenderer = React.useCallback(
		(data: SelectorData) => (
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore: Typescript complains about the button property being "required"
			<SelectorSmallListItem>
				{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
				<ListItemText>{data.label}</ListItemText>
			</SelectorSmallListItem>
		),
		[enableIcons]
	);

	const actualAddNewLabel =
		addNewLabel || i18n.t("standalone.selector.add-new");
	const onLoadButtonInjector = React.useCallback(
		async (query: string) => {
			const results = await onLoad(query);
			if (onAddNew) {
				results.push({
					value: "add-new-button",
					label: actualAddNewLabel,
					icon: <AddIcon />,
					isAddNewButton: true,
				} as Data);
			}
			return results;
		},
		[actualAddNewLabel, onAddNew, onLoad]
	);

	return (
		<AsyncSelect
			defaultOptions
			loadOptions={onLoadButtonInjector}
			placeholder={placeholderLabel}
			value={selected}
			onChange={onChangeHandler}
			isDisabled={disable}
			isMulti={multiSelect}
			isClearable={clearable}
			formatOptionLabel={renderEntry || defaultRenderer}
			noOptionsMessage={getNoOptionsLabel}
			loadingMessage={getLoadingLabel}
			key={`${refreshToken || "no-refresh-token"} ${
				onAddNew
					? `add-new${actualAddNewLabel || "no-add-new-label"}`
					: "no-add-new"
			}`}
			styles={selectorStyles}
		/>
	);
};

export default React.memo(Selector) as typeof Selector;
