import React, { CSSProperties } from "react";
import AsyncSelect from "react-select/async";
import { FormatOptionLabelMeta } from "react-select/src/Select";
import {
	createStyles,
	IconButton,
	ListItem,
	ListItemIcon,
	ListItemText,
	withStyles,
} from "@material-ui/core";
import { Add as AddIcon } from "@material-ui/icons";
import { Styles } from "react-select";

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
/**
 * Callback called when the selection changes
 */
export type SelectorOnSelectCallback<Data extends SelectorData> = (
	value: Data | Data[]
) => void;

export interface SelectorProps<Data extends SelectorData> {
	/**
	 * Data load function
	 * @param search The user search input
	 */
	onLoad: (search: string) => Promise<Data[]>;
	/**
	 * Extended selection change handler
	 * @param data The selected data entry/entries
	 */
	onSelect?: SelectorOnSelectCallback<Data>;
	/**
	 * The currently selected values
	 */
	selected: Data | Data[];
	/**
	 * Is the selector disabled?
	 */
	disable?: boolean;
	/**
	 * Can the selector select multiple values
	 */
	multiSelect?: boolean;
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

const smallListItemStyles = createStyles({
	gutters: {
		paddingLeft: 8,
		paddingRight: 8,
	},
});
export const SmallListItem = withStyles(smallListItemStyles)(ListItem);

const smallListItemIconStyles = createStyles({
	root: {
		minWidth: 0,
		paddingRight: 8,
	},
});
export const SmallListItemIcon = withStyles(smallListItemIconStyles)(
	ListItemIcon
);

const smallIconButtonStyles = createStyles({
	root: {
		padding: 4,
	},
});
export const SmallIconButton = withStyles(smallIconButtonStyles)(IconButton);

/**
 * Controlled selector (react-select) with simple API.
 * This component shouldn't be used directly,
 * please look into SingleSelect and MultiSelect instead.
 */
export default React.memo((props: SelectorProps<any>) => {
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
	} = props;

	const selectorStyles = React.useMemo(
		() => ({
			option: (base: CSSProperties): CSSProperties => ({
				...base,
				padding: 0,
			}),
			...customStyles,
		}),
		[customStyles]
	);

	const getNoOptionsLabel = React.useCallback(
		noDataLabel
			? typeof noDataLabel === "string"
				? () => noDataLabel
				: noDataLabel
			: () => null,
		[noDataLabel]
	);
	const getLoadingLabel = React.useCallback(
		loadingLabel
			? typeof loadingLabel === "string"
				? () => loadingLabel
				: loadingLabel
			: () => null,
		[loadingLabel]
	);
	const onChangeHandler = React.useCallback(
		(data: any) => {
			if (data.isAddNewButton) {
				if (onAddNew) onAddNew();
				return;
			}
			if (onSelect) onSelect(data);
		},
		[onSelect, onAddNew]
	);
	const defaultRenderer = React.useCallback(
		(data: SelectorData) => (
			// @ts-ignore: Typescript complains about the button property being "required"
			<SmallListItem>
				{enableIcons && <SmallListItemIcon>{data.icon}</SmallListItemIcon>}
				<ListItemText>{data.label}</ListItemText>
			</SmallListItem>
		),
		[enableIcons]
	);
	const onLoadButtonInjector = React.useCallback(
		async (query: string) => {
			const results = await onLoad(query);
			if (onAddNew) {
				results.push({
					value: "add-new-button",
					label: addNewLabel || "Add new",
					icon: <AddIcon />,
					isAddNewButton: true,
				});
			}
			return results;
		},
		[addNewLabel, onAddNew, onLoad]
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
			formatOptionLabel={renderEntry || defaultRenderer}
			noOptionsMessage={getNoOptionsLabel}
			loadingMessage={getLoadingLabel}
			key={refreshToken + (onAddNew ? "add-new" : "no-add-new")}
			styles={selectorStyles}
		/>
	);
});
