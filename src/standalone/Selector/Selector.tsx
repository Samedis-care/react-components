import React from "react";
import AsyncSelect from "react-select/async";

export interface SelectorData {
	value: string;
	label: string;
}

/**
 * A callback used to get an label value for a specific input (search) value
 */
type SelectorLabelCallback = (obj: { inputValue: string }) => string | null;
/**
 * Callback called when the selection changes
 */
export type SelectorOnSelectCallback = (value: string | string[]) => void;
/**
 * Callback called when the selection changes
 */
export type SelectorOnSelectExCallback<Data extends SelectorData> = (
	value: Data | Data[]
) => void;

export interface SelectorProps<Data extends SelectorData> {
	/**
	 * Data load function
	 * @param search The user search input
	 */
	onLoad: (search: string) => Promise<Data[]>;
	/**
	 * Simple selection change handler
	 * @param value The selected value(s)
	 */
	onSelect?: SelectorOnSelectCallback;
	/**
	 * Extended selection change handler
	 * @param data The selected data entry/entries
	 */
	onSelectEx?: SelectorOnSelectExCallback<Data>;
	/**
	 * The currently selected values
	 */
	selected: string | string[];
	/**
	 * Is the selector disabled?
	 */
	disable?: boolean;
	/**
	 * Can the selector select multiple values
	 */
	multiSelect?: boolean;

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
}

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
		disable,
		multiSelect,
		onSelect,
		onSelectEx,
	} = props;

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
			if (onSelect) onSelect(data.value);
			if (onSelectEx) onSelectEx(data);
		},
		[onSelect, onSelectEx]
	);

	return (
		<AsyncSelect
			defaultOptions
			loadOptions={onLoad}
			placeholder={placeholderLabel}
			onChange={onChangeHandler}
			isDisabled={disable}
			isMulti={multiSelect}
			noOptionsMessage={getNoOptionsLabel}
			loadingMessage={getLoadingLabel}
		/>
	);
});
