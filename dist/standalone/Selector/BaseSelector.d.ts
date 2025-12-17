import React from "react";
import { InputProps, TextFieldProps } from "@mui/material";
import { TextFieldWithHelpProps } from "../UIKit/TextFieldWithHelp";
import { OutlinedInputProps } from "@mui/material/OutlinedInput";
import { InputProps as StandardInputProps } from "@mui/material/Input/Input";
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
export declare const getStringLabel: (data: BaseSelectorData | string) => string;
export declare const getReactLabel: (data: BaseSelectorData) => React.ReactNode;
export declare const modifyReactLabel: <DataT extends BaseSelectorData>(data: DataT, cb: (prev: React.ReactNode) => React.ReactNode) => DataT;
/**
 * On load handler for selectors using a local dataset
 * Performs a case-insensitive label search
 * @param data The data set
 */
export declare const selectorLocalLoadHandler: (data: BaseSelectorData[]) => (query: string) => BaseSelectorData[];
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
export type BaseSelectorVariants<DataT extends BaseSelectorData, Multi extends boolean> = Multi extends true ? BaseSelectorMulti<DataT> : Multi extends false ? BaseSelectorSingle<DataT> : never;
export type BaseSelectorProps<DataT extends BaseSelectorData, Multi extends boolean> = TextFieldWithHelpProps & BaseSelectorVariants<DataT, Multi> & {
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
    onLoad: (search: string, switchValue: boolean) => DataT[] | Promise<DataT[]>;
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
    textFieldInputClasses?: OutlinedInputProps["classes"] | StandardInputProps["classes"];
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
export interface BaseSelectorIconOwnerState {
    iconSize?: number;
}
export declare const BaseSelectorLruOptionCssClassName = "components-care-base-selector-lru-option";
export type BaseSelectorClassKey = "autocomplete" | "inlineSwitch" | "label" | "icon" | "divider" | "smallLabel" | "checkbox" | "selected" | "listItem" | "wrapper" | "infoBtn";
export interface BaseSelectorContextType {
    addToLru: (...ids: string[]) => void;
}
export declare const BaseSelectorContext: React.Context<BaseSelectorContextType | null>;
declare const BaseSelector: <DataT extends BaseSelectorData, Multi extends boolean>(inProps: BaseSelectorProps<DataT, Multi>) => React.JSX.Element;
declare const _default: typeof BaseSelector;
export default _default;
